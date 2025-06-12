using Microsoft.AspNetCore.Identity;
using Projekt_Zespolowy.Models;

namespace Projekt_Zespolowy.Authentication;

public class AppUser : IdentityUser
{
    [PersonalData] 
    public string? Nickname { get; set; } 

    [PersonalData]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [PersonalData]
    public bool IsDeleted { get; set; } = false;

    public virtual ICollection<Post> PostsAuthored { get; set; } = new List<Post>();
    public virtual ICollection<CommunityMember> CommunityMemberships { get; set; } = new List<CommunityMember>();
    public virtual ICollection<Like> LikesGiven { get; set; } = new List<Like>();
    public virtual ICollection<Follower> Following { get; set; } = new List<Follower>(); // Kogo ja obserwuję
    public virtual ICollection<Follower> Followers { get; set; } = new List<Follower>(); // Kto mnie obserwuje

}
