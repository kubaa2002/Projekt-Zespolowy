using Projekt_Zespolowy.Authentication;
using System.ComponentModel.DataAnnotations;

namespace Projekt_Zespolowy.Models
{
    public class Reaction
    {
        [Key]
        public int ReactionId { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; } = string.Empty;

        public static void PopulateDB(AppDbContext dbContext)
        {
            if (!dbContext.Reactions.Any())
            {
                dbContext.Reactions.Add(new Reaction { Name = "Like" });
                dbContext.Reactions.Add(new Reaction { Name = "Dislike" });
                dbContext.Reactions.Add(new Reaction { Name = "Heart" });
                dbContext.SaveChanges();
            }
        }
    }
}
