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

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    dbContext.Database.EnsureCreated();

    if(!dbContext.Users.Any())
    {
        dbContext.Users.AddRange(
        new AppUser
        {
            Id = "1",
            Nickname = "alice",
        },
        new AppUser
        {
            Id = "2",
            Nickname = "bob",
        },
        new AppUser
        {
            Id="3",
            Nickname = "charlie",
        }

    );
        dbContext.SaveChanges();
    }
    if (!dbContext.Communities.Any())
    {
        dbContext.Communities.AddRange(
            new Community
            {
                Name = "General",
                Description = "General discussions",
                CreatedDateTime = DateTimeOffset.UtcNow,
            },
            new Community
            {
                Name = "Technology",
                Description = "Tech discussions",
                CreatedDateTime = DateTimeOffset.UtcNow,
            }
        );
        dbContext.SaveChanges();
    }
    if (!dbContext.Posts.Any())
    {
        dbContext.Posts.AddRange(
            new Post
            {
                Content = "Welcome to the General community!",
                CreatedDateTime = DateTimeOffset.UtcNow,
                AppUserId = "1", 
                CommunityId = 1 
            },
            new Post
            {
                Content = "Latest tech trends",
                CreatedDateTime = DateTimeOffset.UtcNow,
                AppUserId = "2", 
                CommunityId = 2 
            }
        );
        dbContext.SaveChanges();
    }
    if (!dbContext.Likes.Any())
    {
        dbContext.Likes.AddRange(
            new Like
            {
                AppUserId = "1", 
                PostId = 1002, 
                ReactionType = ReactionType.Like,
                CreatedDateTime = DateTimeOffset.UtcNow
            },
            new Like
            {
                AppUserId = "2", 
                PostId = 1003, 
                ReactionType = ReactionType.Love,
            
            }
        );
        dbContext.SaveChanges();
    }
}



app.MapGet("/", () => "Hello World!");

app.MapGet("/posty", async (AppDbContext db) => await db.Posts.ToListAsync());
app.MapGet("/reakcje", async (AppDbContext db) => await db.Likes.ToListAsync());


app.MapControllers();

app.Run();
