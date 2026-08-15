using JSport.Api.Contracts.Bookings;
using JSport.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JSport.Api.Controllers;

[ApiController, Authorize(Roles = "admin")]
[Route("api/admin")]
public sealed class AdminController(BookingService bookingService) : ControllerBase
{
    [HttpGet("access")]
    public IActionResult VerifyAccess() => Ok(new { role = "admin" });

    [HttpGet("bookings")]
    public async Task<ActionResult<IReadOnlyList<BookingResponse>>> Bookings(CancellationToken cancellationToken)
        => Ok(await bookingService.GetAllAsync(cancellationToken));
}
