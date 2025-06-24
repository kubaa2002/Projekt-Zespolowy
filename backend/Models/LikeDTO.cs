using Projekt_Zespolowy.Models;

namespace Projekt_Zespolowy.Likes
{
    public class LikeDTO
    {
        public string AppUserId { get; set; } = string.Empty;

        public int PostId { get; set; }

        public int ReactionId { get; set; }

        public string ReactionName { get; set; }
        public DateTimeOffset CreatedDateTime { get; set; } = DateTimeOffset.UtcNow;
        public static implicit operator LikeDTO(Like x)
        {
            return new LikeDTO()
            {
                AppUserId = x.AppUserId,
                PostId = x.PostId,
                ReactionId = x.ReactionId,
                CreatedDateTime = x.CreatedDateTime,
                ReactionName = x.Reaction.Name
            };
        }
        public static implicit operator Like(LikeDTO x)
        {
            return new Like()
            {
                AppUserId = x.AppUserId,
                PostId = x.PostId,
                ReactionId = x.ReactionId,
                CreatedDateTime = x.CreatedDateTime
            };
        }
    }
}
