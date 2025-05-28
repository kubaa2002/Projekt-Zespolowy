using Projekt_Zespolowy.Authentication;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Projekt_Zespolowy.Models
{
    public class Share
    {
        [Required]
        public int PostId { get; set; }
        [ForeignKey("PostId")]
        public virtual Post? Post { get; set; }

        [Required]
        public string AppUserId { get; set; } = string.Empty;
        [ForeignKey("AppUserId")]
        public virtual AppUser? User { get; set; }

        [Required]
        public DateTimeOffset SharedAt { get; set; } = DateTimeOffset.UtcNow;
    }
}
