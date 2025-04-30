using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Projekt_Zespolowy.Authentication;

namespace Projekt_Zespolowy.Models;

public class CommunityMember
{
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;

    [ForeignKey("UserId")]
    public AppUser? User { get; set; }

    public int CommunityId { get; set; }

    [ForeignKey("CommunityId")]
    public Community? Community { get; set; }

    [Required, MaxLength(20)]
    public string Role { get; set; } = "member";

    public DateTimeOffset JoinedDateTime { get; set; }
}
