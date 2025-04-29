using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Projekt_Zespolowy.Posts;

namespace Projekt_Zespolowy.Authentication;

public class AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration configuration)
    : IdentityDbContext<AppUser>(options)
{
    public DbSet<RevokedToken> RevokedTokens { get; set; }
    public DbSet<Post> Posts { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        builder.ApplyConfiguration(new PostConfiguration());
        base.OnModelCreating(builder);        
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
    }
}
