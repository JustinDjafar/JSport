namespace JSport.Api.Domain;

public sealed class Venue
{
    public Guid Id { get; set; }
    public required string Name { get; set; }
    public required string Address { get; set; }
    public required string TimeZone { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public ICollection<Court> Courts { get; set; } = [];
}
