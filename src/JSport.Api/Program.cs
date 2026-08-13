using JSport.Api.Data;
using JSport.Api.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Postgres")
    ?? throw new InvalidOperationException("ConnectionStrings:Postgres is not configured.");

builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddDbContext<JSportDbContext>(options => options.UseNpgsql(connectionString));
builder.Services.AddScoped<BookingService>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddCors(options => options.AddDefaultPolicy(policy =>
{
    var origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
    if (origins.Length > 0)
        policy.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod();
}));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthorization();
app.UseCors();

app.MapControllers();

app.Run();

public partial class Program;
