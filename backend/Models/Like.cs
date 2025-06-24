using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Projekt_Zespolowy.Authentication;

namespace Projekt_Zespolowy.Models 
{
    public class Like
    {
       
        [Required]
        public string AppUserId { get; set; } = string.Empty;
        [ForeignKey("AppUserId")]
        public virtual AppUser? AppUser { get; set; }

        [Required]
        public int PostId { get; set; }
        [ForeignKey("PostId")]
        public virtual Post? Post { get; set; }

        [Required]
        public int ReactionId{ get; set; }
        [ForeignKey("ReactionId")]
        public virtual Reaction? Reaction { get; set; }

        [Required]
        public DateTimeOffset CreatedDateTime { get; set; } = DateTimeOffset.UtcNow;
        
    }
    
}