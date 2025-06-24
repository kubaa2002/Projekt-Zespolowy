namespace Projekt_Zespolowy.Models
{
    public class ShareDTO
    {
        public int PostId { get; set; }
        public string AppUserId { get; set; } = string.Empty;
        public DateTimeOffset SharedAt { get; set; } = DateTimeOffset.UtcNow;
        public static implicit operator ShareDTO(Share s)
        {
            return new ShareDTO()
            {
                AppUserId = s.AppUserId,
                PostId = s.PostId,
                SharedAt = s.SharedAt
            };
        }
        public static implicit operator Share(ShareDTO s)
        {
            return new Share()
            {
                AppUserId = s.AppUserId,
                PostId = s.PostId,
                SharedAt = s.SharedAt
            };
        }
    }
}
