namespace JSport.Api.Domain;

public sealed class User
{
    public Guid Id { get; set; }
    public required string FirebaseUid { get; set; }
    public required string Username { get; set; }
    public required string PhoneNumber { get; set; }
    public required string Email { get; set; }
    public string Role { get; set; } = "member";
    public ICollection<Booking> Bookings { get; set; } = [];
}
