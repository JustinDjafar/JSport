using System.ComponentModel.DataAnnotations;
namespace JSport.Api.Contracts.Users;
public sealed record SaveUserProfileRequest([Required, MinLength(3), MaxLength(50)] string Username, [Required, Phone, MaxLength(30)] string PhoneNumber);
