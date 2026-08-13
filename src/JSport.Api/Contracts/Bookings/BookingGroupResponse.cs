namespace JSport.Api.Contracts.Bookings;

public sealed record BookingGroupResponse(
    IReadOnlyList<BookingResponse> Bookings,
    int CourtCount,
    long TotalAmount,
    DateTimeOffset HoldExpiresAt);
