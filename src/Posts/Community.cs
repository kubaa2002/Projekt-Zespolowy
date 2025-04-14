namespace Projekt_Zespolowy.Posts
{
    //TODO: make it as is supposed to be
    //PLACEHOLDER
    public class Community
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public virtual ICollection<Post> Posts { get; set; } = new List<Post>();
    }
}
