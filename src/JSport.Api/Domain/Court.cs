namespace JSport.Api.Domain;

public sealed class Court
{
    public Guid Id { get; set; }
    public Guid VenueId { get; set; }
    public required string Name { get; set; }
    public required string SurfaceType { get; set; }
    public long PricePerHour { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public Venue Venue { get; set; } = null!;
    public ICollection<Booking> Bookings { get; set; } = [];
}
