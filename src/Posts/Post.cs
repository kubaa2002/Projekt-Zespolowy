using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;

namespace Projekt_Zespolowy.Posts
{
    public class Post
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public int? CommunityId { get; set; }
        public string Content { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public int? ParentId { get; set; }
        public bool IsDeleted { get; set; }
        public virtual Community CommunityNavigation { get; set; } = null!;
        public virtual Post ParentNavigation { get; set; } = null!;
        public virtual ICollection<Post> CommentsNavigation { get; set; } = new List<Post>();
        public virtual AppUser AuthorNavigation { get; set; } = null!;
    }
}
