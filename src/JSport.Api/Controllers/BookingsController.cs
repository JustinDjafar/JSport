using JSport.Api.Contracts.Bookings;
using JSport.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace JSport.Api.Controllers;

[ApiController, Authorize]
[Route("api/bookings")]
public sealed class BookingsController(BookingService bookingService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<BookingResponse>>> History(CancellationToken cancellationToken)
    {
        var bookings = await bookingService.GetHistoryAsync(User.FindFirstValue(ClaimTypes.NameIdentifier)!, cancellationToken);
        return Ok(bookings);
    }

    [HttpPost]
    [ProducesResponseType<BookingResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<BookingResponse>> Create(CreateBookingRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var booking = await bookingService.CreateAsync(request, User.FindFirstValue(ClaimTypes.NameIdentifier)!, cancellationToken);
            return CreatedAtAction(nameof(Get), new { bookingCode = booking.BookingCode }, booking);
        }
        catch (BookingValidationException exception)
        {
            return BadRequest(new ProblemDetails { Title = "Invalid booking", Detail = exception.Message, Status = 400 });
        }
        catch (BookingConflictException exception)
        {
            return Conflict(new ProblemDetails { Title = "Time slot unavailable", Detail = exception.Message, Status = 409 });
        }
    }

    [HttpPost("group")]
    [ProducesResponseType<BookingGroupResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<BookingGroupResponse>> CreateGroup(CreateBookingGroupRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var group = await bookingService.CreateGroupAsync(request, User.FindFirstValue(ClaimTypes.NameIdentifier)!, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, group);
        }
        catch (BookingValidationException exception)
        {
            return BadRequest(new ProblemDetails { Title = "Invalid booking", Detail = exception.Message, Status = 400 });
        }
        catch (BookingConflictException exception)
        {
            return Conflict(new ProblemDetails { Title = "Time slot unavailable", Detail = exception.Message, Status = 409 });
        }
    }

    [HttpGet("{bookingCode}")]
    public async Task<ActionResult<BookingResponse>> Get(string bookingCode, CancellationToken cancellationToken)
    {
        var booking = await bookingService.GetAsync(bookingCode, User.FindFirstValue(ClaimTypes.NameIdentifier)!, cancellationToken);
        return booking is null ? NotFound() : Ok(booking);
    }
}
