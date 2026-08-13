using JSport.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace JSport.Api.Data;

public sealed class JSportDbContext(DbContextOptions<JSportDbContext> options) : DbContext(options)
{
    public DbSet<Venue> Venues => Set<Venue>();
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var statusConverter = new EnumToStringConverter<BookingStatus>();

        modelBuilder.Entity<Venue>(entity =>
        {
            entity.ToTable("venues");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(150).IsRequired();
            entity.Property(x => x.Address).HasColumnName("address").HasMaxLength(500).IsRequired();
            entity.Property(x => x.TimeZone).HasColumnName("time_zone").HasMaxLength(80).IsRequired();
            entity.Property(x => x.IsActive).HasColumnName("is_active");
            entity.Property(x => x.CreatedAt).HasColumnName("created_at");
        });

        modelBuilder.Entity<Court>(entity =>
        {
            entity.ToTable("courts");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.VenueId).HasColumnName("venue_id");
            entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(x => x.SurfaceType).HasColumnName("surface_type").HasMaxLength(50).IsRequired();
            entity.Property(x => x.PricePerHour).HasColumnName("price_per_hour");
            entity.Property(x => x.IsActive).HasColumnName("is_active");
            entity.Property(x => x.CreatedAt).HasColumnName("created_at");
            entity.HasIndex(x => new { x.VenueId, x.Name }).IsUnique();
            entity.HasOne(x => x.Venue).WithMany(x => x.Courts).HasForeignKey(x => x.VenueId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Booking>(entity =>
        {
            entity.ToTable("bookings", table =>
            {
                table.HasCheckConstraint("ck_bookings_valid_time", "ends_at > starts_at");
                table.HasCheckConstraint("ck_bookings_positive_amount", "total_amount > 0");
            });
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.BookingCode).HasColumnName("booking_code").HasMaxLength(24).IsRequired();
            entity.Property(x => x.CourtId).HasColumnName("court_id");
            entity.Property(x => x.CustomerName).HasColumnName("customer_name").HasMaxLength(150).IsRequired();
            entity.Property(x => x.CustomerEmail).HasColumnName("customer_email").HasMaxLength(254).IsRequired();
            entity.Property(x => x.CustomerPhone).HasColumnName("customer_phone").HasMaxLength(30).IsRequired();
            entity.Property(x => x.StartsAt).HasColumnName("starts_at");
            entity.Property(x => x.EndsAt).HasColumnName("ends_at");
            entity.Property(x => x.TotalAmount).HasColumnName("total_amount");
            entity.Property(x => x.Status).HasColumnName("status").HasMaxLength(30).HasConversion(statusConverter);
            entity.Property(x => x.HoldExpiresAt).HasColumnName("hold_expires_at");
            entity.Property(x => x.PaymentProvider).HasColumnName("payment_provider").HasMaxLength(30);
            entity.Property(x => x.PaymentReference).HasColumnName("payment_reference").HasMaxLength(100);
            entity.Property(x => x.CreatedAt).HasColumnName("created_at");
            entity.Property(x => x.UpdatedAt).HasColumnName("updated_at");
            entity.HasIndex(x => x.BookingCode).IsUnique();
            entity.HasIndex(x => new { x.CourtId, x.StartsAt, x.EndsAt });
            entity.HasOne(x => x.Court).WithMany(x => x.Bookings).HasForeignKey(x => x.CourtId).OnDelete(DeleteBehavior.Restrict);
        });

        var venueId = Guid.Parse("7e4c55d0-8f4d-4b09-a821-17c90460201a");
        var seededAt = new DateTimeOffset(2026, 1, 1, 0, 0, 0, TimeSpan.Zero);
        modelBuilder.Entity<Venue>().HasData(new Venue
        {
            Id = venueId,
            Name = "JSport Badminton Hall",
            Address = "Update this address",
            TimeZone = "Asia/Jakarta",
            IsActive = true,
            CreatedAt = seededAt
        });
        modelBuilder.Entity<Court>().HasData(
            new Court
            {
                Id = Guid.Parse("84782d10-40da-4497-95df-6db68353f001"),
                VenueId = venueId,
                Name = "Court 1",
                SurfaceType = "Synthetic",
                PricePerHour = 100_000,
                IsActive = true,
                CreatedAt = seededAt
            },
            new Court
            {
                Id = Guid.Parse("84782d10-40da-4497-95df-6db68353f002"),
                VenueId = venueId,
                Name = "Court 2",
                SurfaceType = "Synthetic",
                PricePerHour = 100_000,
                IsActive = true,
                CreatedAt = seededAt
            },
            new Court
            {
                Id = Guid.Parse("84782d10-40da-4497-95df-6db68353f003"),
                VenueId = venueId,
                Name = "Court 3",
                SurfaceType = "Synthetic",
                PricePerHour = 100_000,
                IsActive = true,
                CreatedAt = seededAt
            });
    }
}
