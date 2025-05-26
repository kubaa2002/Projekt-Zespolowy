using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Projekt_Zespolowy.Likes
{
    public class LikeDTO
    {
        public string AppUserId { get; set; } = string.Empty;

        public int PostId { get; set; }

        public ReactionType ReactionType { get; set; }

        public DateTimeOffset CreatedDateTime { get; set; } = DateTimeOffset.UtcNow;
    }
}
