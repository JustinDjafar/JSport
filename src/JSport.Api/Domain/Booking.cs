namespace JSport.Api.Domain;

public sealed class Booking
{
    public Guid Id { get; set; }
    public required string BookingCode { get; set; }
    public Guid CourtId { get; set; }
    public Guid UserId { get; set; }
    public DateTimeOffset StartsAt { get; set; }
    public DateTimeOffset EndsAt { get; set; }
    public long TotalAmount { get; set; }
    public BookingStatus Status { get; set; }
    public DateTimeOffset HoldExpiresAt { get; set; }
    public string? PaymentProvider { get; set; }
    public string? PaymentReference { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    public Court Court { get; set; } = null!;
    public User User { get; set; } = null!;
}
