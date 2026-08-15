namespace JSport.Api.Contracts.Bookings;

public sealed record CreateBookingGroupRequest(
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    IReadOnlyList<Guid> CourtIds);
