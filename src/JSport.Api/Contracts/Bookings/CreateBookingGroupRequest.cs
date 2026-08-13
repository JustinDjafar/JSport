using System.ComponentModel.DataAnnotations;

namespace JSport.Api.Contracts.Bookings;

public sealed record CreateBookingGroupRequest(
    Guid VenueId,
    [Required, MaxLength(150)] string CustomerName,
    [Required, EmailAddress, MaxLength(254)] string CustomerEmail,
    [Required, Phone, MaxLength(30)] string CustomerPhone,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    int CourtCount);
