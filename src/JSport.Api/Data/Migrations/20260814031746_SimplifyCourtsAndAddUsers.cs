using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JSport.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class SimplifyCourtsAndAddUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_courts_venues_venue_id",
                table: "courts");

            migrationBuilder.DropTable(
                name: "venues");

            migrationBuilder.DropIndex(
                name: "IX_courts_venue_id_name",
                table: "courts");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "courts");

            migrationBuilder.DropColumn(
                name: "price_per_hour",
                table: "courts");

            migrationBuilder.DropColumn(
                name: "surface_type",
                table: "courts");

            migrationBuilder.DropColumn(
                name: "venue_id",
                table: "courts");

            migrationBuilder.DropColumn(
                name: "customer_email",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "customer_name",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "customer_phone",
                table: "bookings");

            migrationBuilder.AddColumn<Guid>(
                name: "user_id",
                table: "bookings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    firebase_uid = table.Column<string>(type: "character varying(128)", maxLength: 128, nullable: false),
                    username = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    phone_number = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    email = table.Column<string>(type: "character varying(254)", maxLength: 254, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_courts_name",
                table: "courts",
                column: "name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_bookings_user_id",
                table: "bookings",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_firebase_uid",
                table: "users",
                column: "firebase_uid",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_username",
                table: "users",
                column: "username",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_bookings_users_user_id",
                table: "bookings",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_bookings_users_user_id",
                table: "bookings");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropIndex(
                name: "IX_courts_name",
                table: "courts");

            migrationBuilder.DropIndex(
                name: "IX_bookings_user_id",
                table: "bookings");

            migrationBuilder.DropColumn(
                name: "user_id",
                table: "bookings");

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "created_at",
                table: "courts",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTimeOffset(new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.AddColumn<long>(
                name: "price_per_hour",
                table: "courts",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "surface_type",
                table: "courts",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<Guid>(
                name: "venue_id",
                table: "courts",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "customer_email",
                table: "bookings",
                type: "character varying(254)",
                maxLength: 254,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "customer_name",
                table: "bookings",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "customer_phone",
                table: "bookings",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "venues",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    address = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false),
                    name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    time_zone = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_venues", x => x.id);
                });

            migrationBuilder.UpdateData(
                table: "courts",
                keyColumn: "id",
                keyValue: new Guid("84782d10-40da-4497-95df-6db68353f001"),
                columns: new[] { "created_at", "price_per_hour", "surface_type", "venue_id" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 100000L, "Synthetic", new Guid("7e4c55d0-8f4d-4b09-a821-17c90460201a") });

            migrationBuilder.UpdateData(
                table: "courts",
                keyColumn: "id",
                keyValue: new Guid("84782d10-40da-4497-95df-6db68353f002"),
                columns: new[] { "created_at", "price_per_hour", "surface_type", "venue_id" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 100000L, "Synthetic", new Guid("7e4c55d0-8f4d-4b09-a821-17c90460201a") });

            migrationBuilder.UpdateData(
                table: "courts",
                keyColumn: "id",
                keyValue: new Guid("84782d10-40da-4497-95df-6db68353f003"),
                columns: new[] { "created_at", "price_per_hour", "surface_type", "venue_id" },
                values: new object[] { new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), 100000L, "Synthetic", new Guid("7e4c55d0-8f4d-4b09-a821-17c90460201a") });

            migrationBuilder.InsertData(
                table: "venues",
                columns: new[] { "id", "address", "created_at", "is_active", "name", "time_zone" },
                values: new object[] { new Guid("7e4c55d0-8f4d-4b09-a821-17c90460201a"), "Update this address", new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "JSport Badminton Hall", "Asia/Jakarta" });

            migrationBuilder.CreateIndex(
                name: "IX_courts_venue_id_name",
                table: "courts",
                columns: new[] { "venue_id", "name" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_courts_venues_venue_id",
                table: "courts",
                column: "venue_id",
                principalTable: "venues",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
