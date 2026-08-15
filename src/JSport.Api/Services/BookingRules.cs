namespace JSport.Api.Services;

public static class BookingRules
{
    public static void ValidateTime(DateTimeOffset startsAt, DateTimeOffset endsAt, DateTimeOffset now)
    {
        if (startsAt <= now)
            throw new BookingValidationException("Start time must be in the future.");
        if (endsAt <= startsAt)
            throw new BookingValidationException("End time must be after start time.");
        var durationMinutes = (endsAt - startsAt).TotalMinutes;
        if (durationMinutes is < 60 or > 480 || durationMinutes % 60 != 0)
            throw new BookingValidationException("Booking duration must be between 1 and 8 whole hours.");
        if (startsAt.Minute != 0 || endsAt.Minute != 0 ||
            startsAt.Second != 0 || endsAt.Second != 0 ||
            startsAt.Millisecond != 0 || endsAt.Millisecond != 0)
            throw new BookingValidationException("Booking times must start and end on an exact hour.");
    }

    public static long CalculateTotal(long pricePerHour, DateTimeOffset startsAt, DateTimeOffset endsAt)
    {
        var durationMinutes = checked((long)(endsAt - startsAt).TotalMinutes);
        return checked((pricePerHour * durationMinutes + 59) / 60);
    }
}
