using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Projekt_Zespolowy.Posts;

namespace Projekt_Zespolowy.Sharing
{
    public class SharingConfiguration : IEntityTypeConfiguration<SharedPost>
    {
        public void Configure(EntityTypeBuilder<SharedPost> builder)
        {
            builder.ToTable("SharedPosts");

            builder.HasKey(p => new { p.UserId, p.PostId });

            builder.Property(p => p.UserId)
                .HasMaxLength(256)
                .IsRequired();

            builder.Property(p => p.PostId)
                .HasColumnType("int")
                .IsRequired();

            builder.Property(p => p.ShareDateTime)
                .HasColumnType("datetime2(0)")
                .IsRequired();
        }
    }
}
