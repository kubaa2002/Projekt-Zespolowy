using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Projekt_Zespolowy.Likes;

namespace Projekt_Zespolowy.Models
{
    public class PostDTO
    {
        static public string deletedUserId { get; set; }

        public int Id { get; set; }
        public string Title { get; set; }
        public string? AuthorId { get; set; }
        public string Content { get; set; }
        public int? CommunityId { get; set; }
        public DateTimeOffset CreatedDateTime { get; set; }
        public int? ParentId { get; set; }
        public int ReactionCount { get; set; }
        public string? UserName { get; set; }
        public ICollection<LikeDTO> Likes { get; set; } = new List<LikeDTO>();
        public int? CommentCount { get; set; }
        public static implicit operator PostDTO(Post? p)
        {
            return new PostDTO() { Id = p.Id, Title = p.Title, Content = p.Content, CommunityId = p.CommunityId, AuthorId = p.Author!.IsDeleted ? deletedUserId : p.AppUserId, CreatedDateTime = p.CreatedDateTime, ParentId = p.ParentId, Likes = p.Likes.Select(x => (LikeDTO)x).ToList(), ReactionCount = p.Likes.Count, UserName = p.Author!.IsDeleted ? "<Konto usunięte>" : p.Author.UserName, CommentCount = p.Replies.Where(c => !c.IsDeleted).Count() };
        }
        public static implicit operator Post(PostDTO? p)
        {
            return new Post() { Id = p.Id, Title = p.Title, CommunityId = p.CommunityId, Content = p.Content, AppUserId = p.AuthorId, CreatedDateTime = p.CreatedDateTime, ParentId = p.ParentId, Likes = p.Likes.Select(x => (Like)x).ToList() };
        }
    }
}
