using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Projekt_Zespolowy.Authentication;

namespace Projekt_Zespolowy.Models
{
   

    public class Post
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(2000)]
        public string Content { get; set; } = string.Empty;

        [Required]
        public DateTimeOffset CreatedDateTime { get; set; } = DateTimeOffset.UtcNow;

        [Required]
        public string AppUserId { get; set; } = string.Empty;
        [Required]
        public bool IsDeleted { get; set; } = false;
        [ForeignKey("AppUserId")]
        public virtual AppUser? Author { get; set; }

        public int? CommunityId { get; set; } 
        [ForeignKey("CommunityId")]
        public virtual Community? Community { get; set; }

        public int? ParentId { get; set; }
        [ForeignKey("ParentId")]
        public virtual Post? ParentPost { get; set; }

        public virtual ICollection<Post> Replies { get; set; } = new List<Post>();
        public virtual ICollection<Like> Likes { get; set; } = new List<Like>();
    }
}
