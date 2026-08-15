namespace JSport.Api.Contracts.Users;
public sealed record UserResponse(Guid Id, string Username, string PhoneNumber, string Email, string Role);
