using System.ComponentModel.DataAnnotations;

namespace Projekt_Zespolowy.Models;

public class Community
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTimeOffset CreatedDateTime { get; set; }

    public ICollection<CommunityMember> Members { get; set; } = new List<CommunityMember>();
}
