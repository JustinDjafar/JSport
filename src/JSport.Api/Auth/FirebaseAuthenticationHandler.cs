using System.Security.Claims;
using System.Text.Encodings.Web;
using FirebaseAdmin.Auth;
using JSport.Api.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace JSport.Api.Auth;

public sealed class FirebaseAuthenticationHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder, JSportDbContext db)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var header = Request.Headers.Authorization.ToString();
        if (!header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)) return AuthenticateResult.NoResult();
        try
        {
            var token = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(header[7..].Trim());
            var claims = new List<Claim> { new(ClaimTypes.NameIdentifier, token.Uid) };
            if (token.Claims.TryGetValue("email", out var email) && email is not null) claims.Add(new Claim(ClaimTypes.Email, email.ToString()!));
            var role = await db.Users.AsNoTracking().Where(x => x.FirebaseUid == token.Uid).Select(x => x.Role).SingleOrDefaultAsync(Context.RequestAborted);
            if (!string.IsNullOrWhiteSpace(role)) claims.Add(new Claim(ClaimTypes.Role, role.ToLowerInvariant()));
            return AuthenticateResult.Success(new AuthenticationTicket(new ClaimsPrincipal(new ClaimsIdentity(claims, Scheme.Name)), Scheme.Name));
        }
        catch (Exception exception)
        {
            Logger.LogWarning(exception, "Firebase token verification failed.");
            return AuthenticateResult.Fail("Invalid authentication token.");
        }
    }
}
