using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;
using Projekt_Zespolowy.Services;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers(options =>
{
    options.Filters.Add<RevokedTokenFilter>();
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
//var connectionString = "Data Source=localhost,1433;Database=PZ;User Id=sa;Password=BazaDanych123!;TrustServerCertificate=True;MultipleActiveResultSets=true";
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlServer(connectionString));

builder.Services.AddIdentityCore<AppUser>()
    .AddEntityFrameworkStores<AppDbContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    var secret = builder.Configuration["JwtConfig:Secret"];
    var issuer = builder.Configuration["JwtConfig:ValidIssuer"];
    var audience = builder.Configuration["JwtConfig:ValidAudiences"];
    if (secret is null || issuer is null || audience is null)
    {
        throw new ApplicationException("Jwt is not set in the configuration");
    }
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidAudience = audience,
        ValidIssuer = issuer,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret))
    };
});

builder.Services.Configure<IdentityOptions>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequiredLength = 8;
    options.Password.RequiredUniqueChars = 1;

    options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._";
    options.User.RequireUniqueEmail = true;

});

builder.Services.AddScoped<PostsService>();
builder.Services.AddScoped<CommunityService>();

var app = builder.Build();

// We need to enable this when we will be deploying to a hosting
//app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {

        var count = DateTime.UtcNow;
        var context = services.GetRequiredService<AppDbContext>();
        while (context.Database.CanConnect() == false)
        {
            context = services.GetRequiredService<AppDbContext>();
            //Console.WriteLine(context.Database.CanConnect());
            if (DateTime.UtcNow - count > TimeSpan.FromSeconds(30))
                throw new Exception("Database took too long");
        }
        Console.WriteLine(context.Database.CanConnect());
        var c = await context.Database.GetPendingMigrationsAsync();
        if (c.Any())
        {
            foreach (var migration in context.Database.GetPendingMigrations())
            {
                Console.WriteLine(migration);
            }
            context.Database.Migrate(); // Stosuje oczekuj�ce migracje
        }


        // Tutaj potencjalnie mo�esz wywo�a� metod� do seedingu danych,
        // je�li nie robisz tego wy��cznie przez HasData w OnModelCreating
        // np. SeedData.Initialize(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Wyst�pi� b��d podczas migracji lub seedingu bazy danych.");
    }
}



app.MapGet("/", () => "Hello World!");

app.MapGet("/posty", async (AppDbContext db) => await db.Posts.ToListAsync());
app.MapGet("/reakcje", async (AppDbContext db) => await db.Likes.ToListAsync());


app.MapControllers();

app.Run();
