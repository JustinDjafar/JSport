using System.Security.Claims;
using JSport.Api.Contracts.Users;
using JSport.Api.Data;
using JSport.Api.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JSport.Api.Controllers;

[ApiController, Authorize]
[Route("api/users/me")]
public sealed class UsersController(JSportDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<UserResponse>> Get(CancellationToken cancellationToken)
    {
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var profile = await db.Users.AsNoTracking().SingleOrDefaultAsync(x => x.FirebaseUid == uid, cancellationToken);
        return profile is null ? NotFound() : Ok(Map(profile));
    }

    [HttpPut]
    public async Task<ActionResult<UserResponse>> Save(SaveUserProfileRequest request, CancellationToken cancellationToken)
    {
        var uid = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var email = User.FindFirstValue(ClaimTypes.Email)?.Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email)) return BadRequest(new ProblemDetails { Title = "The login provider did not supply an email address." });
        var profile = await db.Users.SingleOrDefaultAsync(x => x.FirebaseUid == uid, cancellationToken);
        if (profile is null) { profile = new User { Id = Guid.NewGuid(), FirebaseUid = uid, Email = email, Username = request.Username.Trim(), PhoneNumber = request.PhoneNumber.Trim() }; db.Users.Add(profile); }
        else { profile.Email = email; profile.Username = request.Username.Trim(); profile.PhoneNumber = request.PhoneNumber.Trim(); }
        try { await db.SaveChangesAsync(cancellationToken); }
        catch (DbUpdateException) { return Conflict(new ProblemDetails { Title = "That username or email is already in use." }); }
        return Ok(Map(profile));
    }
    private static UserResponse Map(User user) => new(user.Id, user.Username, user.PhoneNumber, user.Email, user.Role);
}
