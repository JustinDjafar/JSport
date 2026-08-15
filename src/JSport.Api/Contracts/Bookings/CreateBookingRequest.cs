namespace JSport.Api.Contracts.Bookings;

public sealed record CreateBookingRequest(
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt);
