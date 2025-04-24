namespace Projekt_Zespolowy.Posts
{
    public class PostDTO
    {
        public int Id { get; set; }
        public int authorId { get; set; }
        public string Content { get; set; }
        public int CommunityId { get; set; }
        public DateTime CreatedDateTime { get; set; }
        public int parentId { get; set; }
        public static implicit operator PostDTO(Post? p)
        {
            return new PostDTO() { Id = p.Id, Content = p.Content, CommunityId = p.CommunityId, authorId = p.authorId, CreatedDateTime = p.CreatedDateTime, parentId = p.parentId };
        }
        public static implicit operator Post(PostDTO? p)
        {
            return new Post() { Id = p.Id, CommunityId = p.CommunityId, Content = p.Content, authorId = p.authorId, CreatedDateTime = p.CreatedDateTime, parentId = p.parentId };
        }
    }
}
