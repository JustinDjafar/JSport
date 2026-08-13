using System.ComponentModel.DataAnnotations;

namespace JSport.Api.Contracts.Bookings;

public sealed record CreateBookingRequest(
    Guid VenueId,
    [property: Required, MaxLength(150)] string CustomerName,
    [property: Required, EmailAddress, MaxLength(254)] string CustomerEmail,
    [property: Required, Phone, MaxLength(30)] string CustomerPhone,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt);
