using JSport.Api.Contracts.Bookings;
using JSport.Api.Data;
using JSport.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace JSport.Api.Services;

public sealed class BookingService(JSportDbContext db, TimeProvider timeProvider, IConfiguration configuration)
{
    private static readonly TimeSpan HoldDuration = TimeSpan.FromMinutes(20);
    private long PricePerHour => configuration.GetValue<long>("Booking:PricePerHour", 100_000);

    public async Task<BookingResponse> CreateAsync(CreateBookingRequest request, string firebaseUid, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        BookingRules.ValidateTime(request.StartsAt, request.EndsAt, now);

        await db.Bookings
            .Where(x => x.Status == BookingStatus.PendingPayment &&
                        x.HoldExpiresAt <= now)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(x => x.Status, BookingStatus.Expired)
                .SetProperty(x => x.UpdatedAt, now), cancellationToken);

        var user = await db.Users.SingleOrDefaultAsync(x => x.FirebaseUid == firebaseUid, cancellationToken)
            ?? throw new BookingValidationException("Complete your profile before booking.");
        var courts = await db.Courts
            .Where(x => x.IsActive)
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);

        if (courts.Count == 0)
            throw new BookingValidationException("No active courts were found.");

        foreach (var court in courts)
        {
            var totalAmount = BookingRules.CalculateTotal(PricePerHour, request.StartsAt, request.EndsAt);
            var booking = new Booking
            {
                Id = Guid.NewGuid(), BookingCode = $"JSP-{now:yyyyMMdd}-{Guid.NewGuid():N}"[..22].ToUpperInvariant(),
                CourtId = court.Id, UserId = user.Id,
                StartsAt = request.StartsAt.ToUniversalTime(), EndsAt = request.EndsAt.ToUniversalTime(),
                TotalAmount = totalAmount, Status = BookingStatus.PendingPayment, HoldExpiresAt = now.Add(HoldDuration),
                CreatedAt = now, UpdatedAt = now, Court = court, User = user
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

    public async Task<BookingGroupResponse> CreateGroupAsync(CreateBookingGroupRequest request, string firebaseUid, CancellationToken cancellationToken)
    {
        var now = timeProvider.GetUtcNow();
        BookingRules.ValidateTime(request.StartsAt, request.EndsAt, now);
        var requestedCourtIds = request.CourtIds.Distinct().ToList();
        if (requestedCourtIds.Count < 1)
            throw new BookingValidationException("At least one court must be requested.");
        if (requestedCourtIds.Count != request.CourtIds.Count || requestedCourtIds.Count > 3)
            throw new BookingValidationException("Select between one and three distinct courts.");

        await db.Bookings
            .Where(x => x.Status == BookingStatus.PendingPayment && x.HoldExpiresAt <= now)
            .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.Status, BookingStatus.Expired).SetProperty(x => x.UpdatedAt, now), cancellationToken);

        var startsAt = request.StartsAt.ToUniversalTime();
        var endsAt = request.EndsAt.ToUniversalTime();
        var user = await db.Users.SingleOrDefaultAsync(x => x.FirebaseUid == firebaseUid, cancellationToken)
            ?? throw new BookingValidationException("Complete your profile before booking.");
        var courts = await db.Courts
            .Where(x => requestedCourtIds.Contains(x.Id) && x.IsActive &&
                !x.Bookings.Any(b => (b.Status == BookingStatus.Confirmed || (b.Status == BookingStatus.PendingPayment && b.HoldExpiresAt > now)) && b.StartsAt < endsAt && startsAt < b.EndsAt))
            .OrderBy(x => x.Name).ToListAsync(cancellationToken);

        if (courts.Count != requestedCourtIds.Count)
            throw new BookingConflictException("One or more selected courts are no longer available. Please choose again.");

        var holdExpiresAt = now.Add(HoldDuration);
        var bookings = courts.Select(court => new Booking
        {
            Id = Guid.NewGuid(), BookingCode = $"JSP-{now:yyyyMMdd}-{Guid.NewGuid():N}"[..22].ToUpperInvariant(), CourtId = court.Id,
            UserId = user.Id, StartsAt = startsAt, EndsAt = endsAt, TotalAmount = BookingRules.CalculateTotal(PricePerHour, startsAt, endsAt),
            Status = BookingStatus.PendingPayment, HoldExpiresAt = holdExpiresAt, CreatedAt = now, UpdatedAt = now, Court = court, User = user
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

    public async Task<BookingResponse?> GetAsync(string bookingCode, string firebaseUid, CancellationToken cancellationToken)
    {
        var booking = await db.Bookings
            .AsNoTracking()
            .Include(x => x.Court).Include(x => x.User)
            .SingleOrDefaultAsync(x => x.BookingCode == bookingCode && x.User.FirebaseUid == firebaseUid, cancellationToken);
        return booking is null ? null : Map(booking);
    }

    public async Task<IReadOnlyList<BookingResponse>> GetHistoryAsync(string firebaseUid, CancellationToken cancellationToken)
    {
        var bookings = await db.Bookings
            .AsNoTracking()
            .Include(x => x.Court).Include(x => x.User)
            .Where(x => x.User.FirebaseUid == firebaseUid)
            .OrderByDescending(x => x.StartsAt)
            .ToListAsync(cancellationToken);
        return bookings.Select(Map).ToList();
    }

    public async Task<IReadOnlyList<BookingResponse>> GetAllAsync(CancellationToken cancellationToken)
    {
        var bookings = await db.Bookings.AsNoTracking().Include(x => x.Court).Include(x => x.User)
            .OrderByDescending(x => x.StartsAt).ToListAsync(cancellationToken);
        return bookings.Select(Map).ToList();
    }

    private static BookingResponse Map(Booking booking) => new(
        booking.Id, booking.BookingCode, booking.CourtId, booking.Court.Name,
        booking.User.Username, booking.User.Email, booking.User.PhoneNumber, booking.StartsAt, booking.EndsAt,
        booking.TotalAmount, booking.Status, booking.HoldExpiresAt);
}

public sealed class BookingValidationException(string message) : Exception(message);
public sealed class BookingConflictException(string message) : Exception(message);
