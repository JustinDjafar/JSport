using JSport.Api.Services;

namespace JSport.Api.Tests;

public sealed class BookingRulesTests
{
    [Fact]
    public void CalculateTotal_PricesWholeHoursCorrectly()
    {
        var startsAt = new DateTimeOffset(2026, 8, 13, 10, 0, 0, TimeSpan.Zero);
        var endsAt = startsAt.AddHours(2);

        var total = BookingRules.CalculateTotal(100_000, startsAt, endsAt);

        Assert.Equal(200_000, total);
    }

    [Fact]
    public void ValidateTime_RejectsNonHourlyBoundary()
    {
        var now = new DateTimeOffset(2026, 8, 13, 9, 0, 0, TimeSpan.Zero);

        var exception = Assert.Throws<BookingValidationException>(() =>
            BookingRules.ValidateTime(now.AddMinutes(45), now.AddMinutes(105), now));

        Assert.Contains("exact hour", exception.Message);
    }

    [Fact]
    public void ValidateTime_RejectsFractionalHourDuration()
    {
        var now = new DateTimeOffset(2026, 8, 13, 9, 0, 0, TimeSpan.Zero);

        var exception = Assert.Throws<BookingValidationException>(() =>
            BookingRules.ValidateTime(now.AddHours(1), now.AddMinutes(150), now));

        Assert.Contains("whole hours", exception.Message);
    }

    [Fact]
    public void ValidateTime_AcceptsValidFutureRange()
    {
        var now = new DateTimeOffset(2026, 8, 13, 9, 0, 0, TimeSpan.Zero);

        BookingRules.ValidateTime(now.AddHours(1), now.AddHours(2), now);
    }
}
