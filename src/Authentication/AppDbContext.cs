using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Projekt_Zespolowy.Models;

namespace Projekt_Zespolowy.Authentication
{

    public class AppDbContext : IdentityDbContext<AppUser> 
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<RevokedToken> RevokedTokens { get; set; }

        public DbSet<Community> Communities { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<CommunityMember> CommunityMembers { get; set; }
        public DbSet<Follower> Followers { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<Share> Shares { get; set; }
        public DbSet<Reaction> Reactions { get; set; }
        public DbSet<PasswordReset> PasswordResets { get; set; }
        public DbSet<Image> Images { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Konfiguracja dla Community
            builder.Entity<Community>()
                .HasIndex(c => c.Name)
                .IsUnique();

            // Konfiguracja dla Reaction
            builder.Entity<Reaction>()
                .HasIndex(r => r.ReactionId)
                .IsUnique();

            // Klucze złożone dla tabel łączących
            builder.Entity<CommunityMember>()
                .HasKey(cm => new { cm.AppUserId, cm.CommunityId });

            builder.Entity<Follower>()
                .HasKey(f => new { f.FollowerId, f.FollowingId });

            builder.Entity<Like>()
                .HasKey(l => new { l.AppUserId, l.PostId });

            builder.Entity<Share>()
                .HasKey(s => new { s.AppUserId, s.PostId });



            // Relacje dla CommunityMember
            builder.Entity<CommunityMember>()
                .HasOne(cm => cm.User)
                .WithMany(u => u.CommunityMemberships)
                .HasForeignKey(cm => cm.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<CommunityMember>()
                .HasOne(cm => cm.Community)
                .WithMany(c => c.Members)
                .HasForeignKey(cm => cm.CommunityId)
                .OnDelete(DeleteBehavior.Cascade);

            // Relacje dla Post
            builder.Entity<Post>()
                .HasOne(p => p.Author)
                .WithMany(u => u.PostsAuthored)
                .HasForeignKey(p => p.AppUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Post>()
                .HasOne(p => p.ParentPost)
                .WithMany(p => p.Replies)
                .HasForeignKey(p => p.ParentId)
                .OnDelete(DeleteBehavior.NoAction);

            // Relacje dla Follower
            builder.Entity<Follower>()
                .HasOne(f => f.FollowerUser)
                .WithMany(u => u.Following)
                .HasForeignKey(f => f.FollowerId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Follower>()
                .HasOne(f => f.FollowingUser)
                .WithMany(u => u.Followers)
                .HasForeignKey(f => f.FollowingId)
                .OnDelete(DeleteBehavior.Restrict);

            // Relacje dla Like
            builder.Entity<Like>()
                .HasOne(l => l.AppUser)
                .WithMany(u => u.LikesGiven)
                .HasForeignKey(l => l.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Like>()
                .HasOne(l => l.Post)
                .WithMany(p => p.Likes)
                .HasForeignKey(l => l.PostId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Like>()
               .HasOne(r => r.Reaction)
               .WithMany()
               .HasForeignKey(r => r.ReactionId)
               .OnDelete(DeleteBehavior.Restrict);

            // Relacje dla Share
            builder.Entity<Share>()
               .HasOne(s => s.Post)
               .WithMany()
               .HasForeignKey(s => s.PostId)
               .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Share>()
                .HasOne(s => s.User)
                .WithMany()
                .HasForeignKey(s => s.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}