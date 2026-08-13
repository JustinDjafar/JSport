using JSport.Api.Data;
using JSport.Api.Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JSport.Api.Controllers;

[ApiController]
[Route("api/venues")]
public sealed class VenuesController(JSportDbContext db, TimeProvider timeProvider) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult> GetVenues(CancellationToken cancellationToken)
    {
        var venues = await db.Venues.AsNoTracking().Where(x => x.IsActive)
            .Select(x => new { x.Id, x.Name, x.Address, x.TimeZone })
            .ToListAsync(cancellationToken);
        return Ok(venues);
    }

    [HttpGet("{venueId:guid}/courts")]
    public async Task<ActionResult> GetCourts(Guid venueId, DateTimeOffset? startsAt, DateTimeOffset? endsAt, CancellationToken cancellationToken)
    {
        if (startsAt.HasValue != endsAt.HasValue || (startsAt.HasValue && endsAt <= startsAt))
            return BadRequest(new ProblemDetails { Title = "Both startsAt and endsAt must form a valid range." });

        var now = timeProvider.GetUtcNow();
        var courts = await db.Courts.AsNoTracking()
            .Where(c => c.VenueId == venueId && c.IsActive)
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.SurfaceType,
                c.PricePerHour,
                IsAvailable = !startsAt.HasValue || !c.Bookings.Any(b =>
                    (b.Status == BookingStatus.Confirmed ||
                     (b.Status == BookingStatus.PendingPayment && b.HoldExpiresAt > now)) &&
                    b.StartsAt < endsAt && startsAt < b.EndsAt)
            })
            .ToListAsync(cancellationToken);
        return Ok(courts);
    }

    [HttpGet("{venueId:guid}/availability")]
    public async Task<ActionResult> GetAvailability(Guid venueId, DateTimeOffset startsAt, DateTimeOffset endsAt,
        int durationMinutes = 60, CancellationToken cancellationToken = default)
    {
        if (endsAt <= startsAt || durationMinutes is < 60 or > 480 || durationMinutes % 60 != 0)
            return BadRequest(new ProblemDetails { Title = "Invalid availability range or duration." });

        var now = timeProvider.GetUtcNow();
        var courtIds = await db.Courts.AsNoTracking()
            .Where(c => c.VenueId == venueId && c.IsActive && c.Venue.IsActive)
            .Select(c => c.Id).ToListAsync(cancellationToken);
        var bookings = await db.Bookings.AsNoTracking()
            .Where(b => courtIds.Contains(b.CourtId) && b.StartsAt < endsAt && startsAt < b.EndsAt &&
                (b.Status == BookingStatus.Confirmed || (b.Status == BookingStatus.PendingPayment && b.HoldExpiresAt > now)))
            .Select(b => new { b.CourtId, b.StartsAt, b.EndsAt, b.Status })
            .ToListAsync(cancellationToken);

        var slots = new List<object>();
        for (var start = startsAt; start.AddMinutes(durationMinutes) <= endsAt; start = start.AddHours(1))
        {
            var end = start.AddMinutes(durationMinutes);
            var overlapping = bookings.Where(b => b.StartsAt < end && start < b.EndsAt).ToList();
            var held = overlapping.Where(b => b.Status == BookingStatus.PendingPayment).Select(b => b.CourtId).Distinct().Count();
            var booked = overlapping.Where(b => b.Status == BookingStatus.Confirmed).Select(b => b.CourtId).Distinct().Count();
            var unavailable = overlapping.Select(b => b.CourtId).Distinct().Count();
            slots.Add(new { StartsAt = start, EndsAt = end, AvailableCourts = courtIds.Count - unavailable, HeldCourts = held, BookedCourts = booked, TotalCourts = courtIds.Count });
        }
        return Ok(slots);
    }
}
