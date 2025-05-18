using Projekt_Zespolowy.Models;

namespace Projekt_Zespolowy.Posts
{
    public class PostDTO
    {
        public int Id { get; set; }
        public string AuthorId { get; set; }
        public string Content { get; set; }
        public int? CommunityId { get; set; }
        public DateTimeOffset CreatedDateTime { get; set; }
        public int? ParentId { get; set; }
        public bool IsDeleted { get; set; }
        public static implicit operator PostDTO(Post? p)
        {
            return new PostDTO() { Id = p.Id, Content = p.Content, CommunityId = p.CommunityId, AuthorId = p.AppUserId, CreatedDateTime = p.CreatedDateTime, ParentId = p.ParentId };
        }
        public static implicit operator Post(PostDTO? p)
        {
            return new Post() { Id = p.Id, CommunityId = p.CommunityId, Content = p.Content, AppUserId = p.AuthorId, CreatedDateTime = p.CreatedDateTime, ParentId = p.ParentId };
        }
    }
}
