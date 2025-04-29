using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Projekt_Zespolowy.Posts
{
    public class PostConfiguration : IEntityTypeConfiguration<Post>
    {
        public void Configure(EntityTypeBuilder<Post> builder)
        {
            builder.ToTable("Posts");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.authorId)
                .HasColumnType("int")
                .IsRequired();                

            builder.Property(p => p.CommunityId)
                .HasColumnType("int");

            builder.Property(p => p.Content)
                .HasMaxLength(2000)
                .IsRequired();

            builder.Property(p => p.CreatedDateTime)
                .HasColumnType("datetime2(0)")
                .IsRequired();
            //builder.Property(p => p.UpdatedDateTime)
            //    .HasColumnType("datetime2(0)")
            //    .IsRequired();

            builder.Property(p => p.parentId)
                .HasColumnType("int");                
        }
    }
}
