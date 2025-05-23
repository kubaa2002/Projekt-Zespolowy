using System;
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
        public ReactionType ReactionType { get; set; } 

        [Required]
        public DateTimeOffset CreatedDateTime { get; set; } = DateTimeOffset.UtcNow;
        
    }
    public enum ReactionType
    {
        
        Like = 1,
        Love = 2,
        Haha = 3,
        Wow = 4,
        Sad = 5,
        Angry = 6
    }
}