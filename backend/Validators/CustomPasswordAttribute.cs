using System.ComponentModel.DataAnnotations;
namespace Projekt_Zespolowy.Validators;

public class CustomPasswordAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object value, ValidationContext validationContext)
    {
        string? password = value as string;

        if (string.IsNullOrEmpty(password))
            return new ValidationResult("Hasło jest wymagane");

        if (password.Length < 8)
            return new ValidationResult("Hasło musi mieć co najmniej 8 znaków");
        if (password.Length > 32)
            return new ValidationResult("Hasło może mieć maksymalnie 32 znaki");

        if (!password.Any(char.IsLower))
            return new ValidationResult("Hasło musi zawierać co najmniej jedną małą literę");
        if (!password.Any(char.IsUpper))
            return new ValidationResult("Hasło musi zawierać co najmniej jedną wielką literę");
        if (!password.Any(char.IsDigit))
            return new ValidationResult("Hasło musi zawierać co najmniej jedną cyfrę");
        if (!password.Any(ch => !char.IsLetterOrDigit(ch)))
            return new ValidationResult("Hasło musi zawierać co najmniej jeden znak specjalny");

        return ValidationResult.Success;
    }
}