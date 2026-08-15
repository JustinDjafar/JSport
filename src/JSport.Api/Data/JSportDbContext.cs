using JSport.Api.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace JSport.Api.Data;

public sealed class JSportDbContext(DbContextOptions<JSportDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Court> Courts => Set<Court>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var statusConverter = new EnumToStringConverter<BookingStatus>();

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("users");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.FirebaseUid).HasColumnName("firebase_uid").HasMaxLength(128).IsRequired();
            entity.Property(x => x.Username).HasColumnName("username").HasMaxLength(50).IsRequired();
            entity.Property(x => x.PhoneNumber).HasColumnName("phone_number").HasMaxLength(30).IsRequired();
            entity.Property(x => x.Email).HasColumnName("email").HasMaxLength(254).IsRequired();
            entity.Property(x => x.Role).HasColumnName("role").HasMaxLength(20).HasDefaultValue("member").IsRequired();
            entity.HasIndex(x => x.FirebaseUid).IsUnique();
            entity.HasIndex(x => x.Email).IsUnique();
            entity.HasIndex(x => x.Username).IsUnique();
        });

        modelBuilder.Entity<Court>(entity =>
        {
            entity.ToTable("courts");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.Id).HasColumnName("id");
            entity.Property(x => x.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
            entity.Property(x => x.IsActive).HasColumnName("is_active");
            entity.HasIndex(x => x.Name).IsUnique();
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
            entity.Property(x => x.UserId).HasColumnName("user_id");
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
            entity.HasIndex(x => x.UserId);
            entity.HasOne(x => x.Court).WithMany(x => x.Bookings).HasForeignKey(x => x.CourtId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.User).WithMany(x => x.Bookings).HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Court>().HasData(
            new Court
            {
                Id = Guid.Parse("84782d10-40da-4497-95df-6db68353f001"),
                Name = "Court 1",
                IsActive = true
            },
            new Court
            {
                Id = Guid.Parse("84782d10-40da-4497-95df-6db68353f002"),
                Name = "Court 2",
                IsActive = true
            },
            new Court
            {
                Id = Guid.Parse("84782d10-40da-4497-95df-6db68353f003"),
                Name = "Court 3",
                IsActive = true
            });
    }
}
