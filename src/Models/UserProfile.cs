using System;
using System.ComponentModel.DataAnnotations;

namespace Projekt_Zespolowy.Models
{
    public class UserProfile
    {
        public int Id { get; set; }

        [Required]
        [StringLength(50, MinimumLength = 3)]
        public string Username { get; set; } = null!;

        public DateTime CreatedDate { get; set; }

        public bool IsMe { get; set; }

        public int FollowersCount { get; set; }

        public int FollowingCount { get; set; }

        public int CommunitiesCount { get; set; }
    }
}
