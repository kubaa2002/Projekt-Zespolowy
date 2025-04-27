using Projekt_Zespolowy.Authentication;

namespace Projekt_Zespolowy.Posts
{
    //PLACEHOLDER
    public class Post
    {
        public int Id { get; set; }
        public int authorId { get; set; }
        public int? CommunityId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public int? parentId { get; set; }
        public virtual Community CommunityNavigation { get; set; } = null!;
        public virtual Post ParentNavigation { get; set; } = null!;
        public virtual ICollection<Post> CommentsNavigation { get; set; } = new List<Post>();
        public virtual AppUser AuthorNavigation { get; set; } = null!;
    }
}
