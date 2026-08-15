using JSport.Api.Data;
using JSport.Api.Services;
using JSport.Api.Auth;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Postgres")
    ?? throw new InvalidOperationException("ConnectionStrings:Postgres is not configured.");

builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
var firebaseProjectId = builder.Configuration["Firebase:ProjectId"] ?? throw new InvalidOperationException("Firebase:ProjectId is not configured.");
FirebaseApp.Create(new AppOptions { ProjectId = firebaseProjectId, Credential = GoogleCredential.GetApplicationDefault() });
builder.Services.AddAuthentication("Firebase").AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Firebase", _ => { });
builder.Services.AddAuthorization();
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

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program;
