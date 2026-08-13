using JSport.Api.Domain;

namespace JSport.Api.Contracts.Bookings;

public sealed record BookingResponse(
    Guid Id,
    string BookingCode,
    Guid CourtId,
    string CourtName,
    string VenueName,
    string CustomerName,
    string CustomerEmail,
    string CustomerPhone,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    long TotalAmount,
    BookingStatus Status,
    DateTimeOffset HoldExpiresAt);
