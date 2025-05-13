using Projekt_Zespolowy.Authentication;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Projekt_Zespolowy.Models
{
    public class Follower
    {
        [Required]
        public string FollowerId { get; set; } = string.Empty;
        [ForeignKey("FollowerId")]
        public virtual AppUser? FollowerUser { get; set; }

        [Required]
        public string FollowingId { get; set; } = string.Empty; 
        [ForeignKey("FollowingId")]
        public virtual AppUser? FollowingUser { get; set; }

        [Required]
        public DateTimeOffset CreatedDateTime { get; set; } = DateTimeOffset.UtcNow; 
    }
}
