using System.ComponentModel.DataAnnotations;

namespace Projekt_Zespolowy.Validators;

public class CustomUserNameAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object value, ValidationContext validationContext)
    {
        string? userName = value as string;

        if (string.IsNullOrEmpty(userName))
            return new ValidationResult("Pseudonim jest wymagany");

        if (userName.Length < 3)
            return new ValidationResult("Pseudonim musi mieć co najmniej 3 znaki");
        if (userName.Length > 25)
            return new ValidationResult("Pseudonim może mieć maksymalnie 25 znaków");

        if (!userName.All(ch => char.IsLetterOrDigit(ch) || ch == '.' || ch == '-' || ch == '_'))
            return new ValidationResult("Pseudonim może zawierać tylko litery, cyfry, kropkę, myślnik lub podkreślnik");

        return ValidationResult.Success;
    }
}