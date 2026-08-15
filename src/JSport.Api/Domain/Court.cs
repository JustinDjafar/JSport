namespace JSport.Api.Domain;

public sealed class Court
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<Booking> Bookings { get; set; } = [];
}
