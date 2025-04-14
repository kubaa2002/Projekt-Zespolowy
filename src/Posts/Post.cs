namespace Projekt_Zespolowy.Posts
{
    //PLACEHOLDER
    public class Post
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public int CommunityId { get; set; }
        public virtual Community CommunityNavigation { get; set; } = null!;
    }
}
