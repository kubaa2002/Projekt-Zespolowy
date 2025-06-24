using System.ComponentModel.DataAnnotations;

namespace Projekt_Zespolowy.Authentication;

public class LoginModel
{
    [Required(ErrorMessage = "Email jest wymagany")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Hasło jest wymagane")]
    public string Password { get; set; } = string.Empty;
}

