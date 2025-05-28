namespace Projekt_Zespolowy.UserProfile
{
    public class UserProfileDTo
    {
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTimeOffset CreatedAt { get; set; }
        public bool IsMe { get; set; }

        public int FollowersCount { get; set; }
        public int FollowingCount { get; set; }
        public int CommunitiesCount { get; set; }
    }
}
    
