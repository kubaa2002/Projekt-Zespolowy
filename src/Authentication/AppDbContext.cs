using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Projekt_Zespolowy.Models;

namespace Projekt_Zespolowy.Authentication;

public class AppDbContext(DbContextOptions<AppDbContext> options, IConfiguration configuration)
    : IdentityDbContext<AppUser>(options)
{
    public DbSet<RevokedToken> RevokedTokens { get; set; }
    public DbSet<Community> Communities { get; set; }
    public DbSet<CommunityMember> CommunityMembers { get; set; }


    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        optionsBuilder.UseSqlServer(configuration.GetConnectionString("DefaultConnection"));
    }
}
