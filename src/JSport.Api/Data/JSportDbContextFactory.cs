using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace JSport.Api.Data;

public sealed class JSportDbContextFactory : IDesignTimeDbContextFactory<JSportDbContext>
{
    public JSportDbContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__Postgres")
            ?? "Host=localhost;Port=5432;Database=jsport;Username=postgres;Password=postgres";
        return new JSportDbContext(new DbContextOptionsBuilder<JSportDbContext>().UseNpgsql(connection).Options);
    }
}
