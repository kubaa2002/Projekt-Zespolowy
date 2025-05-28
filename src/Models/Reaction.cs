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
    }
}
