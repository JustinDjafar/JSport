using JSport.Api.Contracts.Bookings;
using JSport.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace JSport.Api.Controllers;

[ApiController]
[Route("api/bookings")]
public sealed class BookingsController(BookingService bookingService) : ControllerBase
{
    [HttpPost]
    [ProducesResponseType<BookingResponse>(StatusCodes.Status201Created)]
    public async Task<ActionResult<BookingResponse>> Create(CreateBookingRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var booking = await bookingService.CreateAsync(request, cancellationToken);
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

    [HttpGet("{bookingCode}")]
    public async Task<ActionResult<BookingResponse>> Get(string bookingCode, CancellationToken cancellationToken)
    {
        var booking = await bookingService.GetAsync(bookingCode, cancellationToken);
        return booking is null ? NotFound() : Ok(booking);
    }
}
