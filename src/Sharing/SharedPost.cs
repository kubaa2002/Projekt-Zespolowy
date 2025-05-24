using System.ComponentModel.DataAnnotations.Schema;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;
using Projekt_Zespolowy.Posts;

namespace Projekt_Zespolowy.Sharing
{
    public class SharedPost
    {
        //public int Id { get; set; }
        public string UserId { get; set; }
        public int PostId { get; set; }
        public DateTime ShareDateTime { get; set; }

        [ForeignKey("PostId")]
        public virtual Post PostNavigation { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual AppUser UserNavigation { get; set; } = null!;
    }
}
