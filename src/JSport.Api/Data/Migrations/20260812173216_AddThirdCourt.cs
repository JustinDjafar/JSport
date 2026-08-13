using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace JSport.Api.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddThirdCourt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "courts",
                columns: new[] { "id", "created_at", "is_active", "name", "price_per_hour", "surface_type", "venue_id" },
                values: new object[] { new Guid("84782d10-40da-4497-95df-6db68353f003"), new DateTimeOffset(new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), new TimeSpan(0, 0, 0, 0, 0)), true, "Court 3", 100000L, "Synthetic", new Guid("7e4c55d0-8f4d-4b09-a821-17c90460201a") });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "courts",
                keyColumn: "id",
                keyValue: new Guid("84782d10-40da-4497-95df-6db68353f003"));
        }
    }
}
