using JSport.Api.Contracts.Bookings;
using JSport.Api.Data;
using JSport.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace JSport.Api.Services;

public sealed class BookingService(JSportDbContext db, TimeProvider timeProvider)
{
    private static readonly TimeSpan HoldDuration = TimeSpan.FromMinutes(20);

    public async Task<BookingResponse> CreateAsync(CreateBookingRequest request, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        BookingRules.ValidateTime(request.StartsAt, request.EndsAt, now);

        await db.Bookings
            .Where(x => x.Court.VenueId == request.VenueId && x.Status == BookingStatus.PendingPayment &&
                        x.HoldExpiresAt <= now)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.Status, BookingStatus.Expired)
                .SetProperty(x => x.UpdatedAt, now), cancellationToken);

        var courts = await db.Courts.Include(x => x.Venue)
            .Where(x => x.VenueId == request.VenueId && x.IsActive && x.Venue.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        if (courts.Count == 0)
            throw new BookingValidationException("Venue was not found or has no active courts.");

        foreach (var court in courts)
        {
            var totalAmount = BookingRules.CalculateTotal(court.PricePerHour, request.StartsAt, request.EndsAt);
            var booking = new Booking
            {
                Id = Guid.NewGuid(), BookingCode = $"JSP-{now:yyyyMMdd}-{Guid.NewGuid():N}"[..22].ToUpperInvariant(),
                CourtId = court.Id, CustomerName = request.CustomerName.Trim(),
                CustomerEmail = request.CustomerEmail.Trim().ToLowerInvariant(), CustomerPhone = request.CustomerPhone.Trim(),
                StartsAt = request.StartsAt.ToUniversalTime(), EndsAt = request.EndsAt.ToUniversalTime(),
                TotalAmount = totalAmount, Status = BookingStatus.PendingPayment, HoldExpiresAt = now.Add(HoldDuration),
                CreatedAt = now, UpdatedAt = now, Court = court
            };
            db.Bookings.Add(booking);
            try
            {
                await db.SaveChangesAsync(cancellationToken);
                return Map(booking);
            }
            catch (DbUpdateException exception) when (exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.ExclusionViolation })
            {
                db.Entry(booking).State = EntityState.Detached;
            }
        }
        throw new BookingConflictException("All courts are already reserved for the selected time.");
    }

    public async Task<BookingGroupResponse> CreateGroupAsync(CreateBookingGroupRequest request, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        BookingRules.ValidateTime(request.StartsAt, request.EndsAt, now);
        if (request.CourtCount < 1)
            throw new BookingValidationException("At least one court must be requested.");

        await db.Bookings
            .Where(x => x.Court.VenueId == request.VenueId && x.Status == BookingStatus.PendingPayment && x.HoldExpiresAt <= now)
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.Status, BookingStatus.Expired).SetProperty(x => x.UpdatedAt, now), cancellationToken);

        var startsAt = request.StartsAt.ToUniversalTime();
        var endsAt = request.EndsAt.ToUniversalTime();
        var courts = await db.Courts.Include(x => x.Venue)
            .Where(x => x.VenueId == request.VenueId && x.IsActive && x.Venue.IsActive &&
                !x.Bookings.Any(b => (b.Status == BookingStatus.Confirmed || (b.Status == BookingStatus.PendingPayment && b.HoldExpiresAt > now)) && b.StartsAt < endsAt && startsAt < b.EndsAt))
            .OrderBy(x => x.Name).Take(request.CourtCount).ToListAsync(cancellationToken);

        if (courts.Count < request.CourtCount)
            throw new BookingConflictException($"Only {courts.Count} courts are available for the selected time.");

        var holdExpiresAt = now.Add(HoldDuration);
        var bookings = courts.Select(court => new Booking
        {
            Id = Guid.NewGuid(), BookingCode = $"JSP-{now:yyyyMMdd}-{Guid.NewGuid():N}"[..22].ToUpperInvariant(), CourtId = court.Id,
            CustomerName = request.CustomerName.Trim(), CustomerEmail = request.CustomerEmail.Trim().ToLowerInvariant(), CustomerPhone = request.CustomerPhone.Trim(),
            StartsAt = startsAt, EndsAt = endsAt, TotalAmount = BookingRules.CalculateTotal(court.PricePerHour, startsAt, endsAt),
            Status = BookingStatus.PendingPayment, HoldExpiresAt = holdExpiresAt, CreatedAt = now, UpdatedAt = now, Court = court
        }).ToList();

        db.Bookings.AddRange(bookings);
        try { await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateException exception) when (exception.InnerException is PostgresException { SqlState: PostgresErrorCodes.ExclusionViolation })
        {
            throw new BookingConflictException("One or more requested courts were just reserved. Please choose again.");
        }

        var responses = bookings.Select(Map).ToList();
        return new BookingGroupResponse(responses, responses.Count, responses.Sum(x => x.TotalAmount), holdExpiresAt);
    }

    public async Task<BookingResponse?> GetAsync(string bookingCode, CancellationToken cancellationToken)
    {
        var booking = await db.Bookings
            .AsNoTracking()
            .Include(x => x.Court).ThenInclude(x => x.Venue)
            .SingleOrDefaultAsync(x => x.BookingCode == bookingCode, cancellationToken);
        return booking is null ? null : Map(booking);
    }

    private static BookingResponse Map(Booking booking) => new(
        booking.Id, booking.BookingCode, booking.CourtId, booking.Court.Name, booking.Court.Venue.Name,
        booking.CustomerName, booking.CustomerEmail, booking.CustomerPhone, booking.StartsAt, booking.EndsAt,
        booking.TotalAmount, booking.Status, booking.HoldExpiresAt);
}

public sealed class BookingValidationException(string message) : Exception(message);
public sealed class BookingConflictException(string message) : Exception(message);
