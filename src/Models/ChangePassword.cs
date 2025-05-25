using System.ComponentModel.DataAnnotations;

public class ChangePasswordModel
{
    [Required(ErrorMessage = "Stare hasło jest wymagane")]
    public string OldPassword { get; set; }  = string.Empty;

    [Required(ErrorMessage = "Nowe hasło jest wymagane")]
    public string NewPassword { get; set; }  = string.Empty;
}