using Microsoft.EntityFrameworkCore.Query.SqlExpressions;

namespace Projekt_Zespolowy.Posts
{
    //PLACEHOLDER
    public class Post
    {
        public int Id { get; set; }
        public int AuthorId { get; set; }
        public int CommunityId { get; set; }
        public virtual Community CommunityNavigation { get; set; } = null!;
        public string Content { get; set; }
        public DateTime CreatedDatetime { get; set; }
        public DateTime UpdatedDateTime { get; set; }
        public int? ParentId { get; set; }
    }
}
