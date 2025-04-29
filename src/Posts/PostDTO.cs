namespace Projekt_Zespolowy.Posts
{
    public class PostDTO
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public int CommunityId { get; set; }
        public static implicit operator PostDTO(Post? p)
        {
            return new PostDTO() { Id = p.Id, Content = p.Content, CommunityId = p.CommunityId };
        }
        public static implicit operator Post(PostDTO? p)
        {
            return new Post() { Id = p.Id, Content = p.Content, CommunityId = p.CommunityId };
        }
    }
}
