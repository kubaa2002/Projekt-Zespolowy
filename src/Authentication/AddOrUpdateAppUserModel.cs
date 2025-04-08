using Projekt_Zespolowy.Validators;
using System.ComponentModel.DataAnnotations;

namespace Projekt_Zespolowy.Authentication;

public class AddOrUpdateAppUserModel
{
    [CustomUserName]
    public string UserName { get; set; } = string.Empty;

    [EmailAddress(ErrorMessage ="Email musi być poprawny")]
    [Required(ErrorMessage = "Email jest wymagany")]
    public string Email { get; set; } = string.Empty;

    [CustomPassword]
    public string Password { get; set; } = string.Empty;
}

