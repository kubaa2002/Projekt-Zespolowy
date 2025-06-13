using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Projekt_Zespolowy.Services;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using Projekt_Zespolowy.Validators;
using System.Text.Json.Serialization;
namespace Projekt_Zespolowy.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _dbContext;

    private readonly IEmailService _emailService;

    public UserController(UserManager<AppUser> userManager, IConfiguration configuration, AppDbContext dbContext, IEmailService emailService)
    {
        _userManager = userManager;
        _configuration = configuration;
        _dbContext = dbContext;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] AddOrUpdateAppUserModel model)
    {
        if (ModelState.IsValid)
        {
            var existedUser = await _userManager.FindByNameAsync(model.UserName);
            var errors = new ErrorResponse { Status = 400 };
            if (existedUser != null)
            {
                errors.Errors["UserName"] = new List<string> { "Nazwa użytkownika zajęta" };
                return BadRequest(errors);
            }

            existedUser = await _userManager.FindByEmailAsync(model.Email);
            if (existedUser != null)
            {
                errors.Errors["Email"] = new List<string> { "Nie można użyć tego adresu email" };
                return BadRequest(errors);
            }

            var user = new AppUser
            {
                UserName = model.UserName,
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                IsDeleted = false,
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                var token = GenerateToken(model.UserName);
                return Created($"/user/{user.Id}", new { token, user.UserName });
            }

            foreach (var error in result.Errors)
            {
                ModelState.AddModelError("", error.Description);
            }
        }

        return BadRequest(ModelState);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginModel model)
    {

        if (ModelState.IsValid)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null)
            {
                if (user.IsDeleted)
                {
                    var errors2 = new ErrorResponse { Status = 403 };
                    errors2.Errors["error"] = new List<string> { "Konto jest usunięte." };
                    return StatusCode(403, errors2);
                }

                if (await _userManager.CheckPasswordAsync(user, model.Password))
                {
                    var token = GenerateToken(user.UserName);
                    return Ok(new { token, user.UserName });
                }
            }
            var errors = new ErrorResponse { Status = 401 };
            errors.Errors["error"] = new List<string> { "Niepoprawna nazwa użytkownika lub hasło" };
            return Unauthorized(errors);
        }
        return BadRequest(ModelState);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        if (string.IsNullOrEmpty(token))
        {
            return BadRequest(new { message = "Brak tokenu w nagłówku" });
        }

        var revokedToken = new RevokedToken
        {
            Token = token,
            RevokedAt = DateTime.UtcNow
        };

        _dbContext.RevokedTokens.Add(revokedToken);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Wylogowano pomyślnie" });
    }

    private string? GenerateToken(string userName)
    {
        var secret = _configuration["JwtConfig:Secret"];
        var issuer = _configuration["JwtConfig:ValidIssuer"];
        var audience = _configuration["JwtConfig:ValidAudiences"];
        if (secret is null || issuer is null || audience is null)
        {
            throw new ApplicationException("Jwt is not set in the configuration");
        }
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var tokenHandler = new JwtSecurityTokenHandler();

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, userName)
            }),
            Expires = DateTime.UtcNow.AddDays(1),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256Signature)
        };

        var securityToken = tokenHandler.CreateToken(tokenDescriptor);

        var token = tokenHandler.WriteToken(securityToken);
        return token;
    }

    [Authorize]
    [HttpGet("test")]
    public async Task<IActionResult> Me()
    {

        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(userName))
        {
            return Unauthorized(new { message = "Nie udało się ustalić tożsamości użytkownika" });
        }

        var user = await _userManager.FindByNameAsync(userName);
        if (user == null)
        {
            return Unauthorized(new { message = "Użytkownik nie istnieje" });
        }

        return Ok(new { userName = user.UserName, email = user.Email, id = user.Id });

    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
    {
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(userName))
        {
            return NotFound(new { message = "Nie udało się zidentyfikować użytkownika." });
        }

        var user = await _userManager.FindByNameAsync(userName);
        if (user == null)
        {
            return NotFound(new { message = "Użytkownik nie istnieje." });
        }

        var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);

        if (result.Succeeded)
        {
            return Ok(new { message = "Hasło zostało pomyślnie zmienione." });
        }

        var errors = new ErrorResponse { Status = 400 };
        var errorList = new List<string>();
        foreach (var error in result.Errors)
        {
            errorList.Add(error.Description);
        }
        errors.Errors["PasswordError"] = errorList;

        if (result.Errors.Any(e => e.Code == "PasswordMismatch"))
        {
            return Unauthorized(errors); // Zwracamy 401 
        }

        return BadRequest(errors); // Zwracamy 400 dla innych błędów 
    }

    [Authorize]
    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteUser([FromBody] DeleteUserModel model)
    {
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(userName))
        {
            return Unauthorized(new { error = "Nie udało się ustalić tożsamości użytkownika." });
        }

        var user = await _userManager.FindByNameAsync(userName);
        if (user == null)
        {
            return NotFound(new { error = "Użytkownik nie istnieje." });
        }

        if (!await _userManager.CheckPasswordAsync(user, model.CurrentPassword))
        {
            return Unauthorized(new { error = "Nieprawidłowe hasło." });
        }

        user.IsDeleted = true;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {

            return BadRequest();
        }

        var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
        if (!string.IsNullOrEmpty(token))
        {
            var revokedToken = new RevokedToken
            {
                Token = token,
                RevokedAt = DateTime.UtcNow
            };
            _dbContext.RevokedTokens.Add(revokedToken);
            await _dbContext.SaveChangesAsync();
        }

        return Ok(new { message = "Konto zostało pomyślnie usunięte." });
    }

    [HttpPost("sendResetLink")]
    public async Task<IActionResult> SendResetLink([FromBody] SendResetLinkRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest(new { error = "Email jest wymagany." });
        }

        var user = await _userManager.FindByEmailAsync(request.Email);

        if (user == null)
        {
            // Zawsze zwracaj ogólny komunikat dla bezpieczeństwa
            return Ok(new { message = "Jeśli podany adres e-mail istnieje w naszej bazie, link do resetowania hasła zostanie wysłany." });
        }

        // Generowanie tokena resetującego hasło za pomocą ASP.NET Core Identity
        var identityResetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

        // Unieważnij wszystkie poprzednie tokeny dla tego użytkownika
        var existingTokens = await _dbContext.PasswordResets
                                             .Where(t => t.Email == request.Email && !t.Used)
                                             .ToListAsync();
        foreach (var token in existingTokens)
        {
            token.Used = true; 
        }

        // Zapisz ten token w swojej tabeli PasswordResets
        var createdAt = DateTime.UtcNow;
        var expiresAt = createdAt.AddHours(1); 

        var passwordResetEntity = new PasswordReset
        {
            Email = user.Email,
            Token = identityResetToken,
            CreatedAt = createdAt,
            ExpiresAt = expiresAt,
            Used = false
        };

        _dbContext.PasswordResets.Add(passwordResetEntity);
        await _dbContext.SaveChangesAsync();

        // Utwórz link do resetowania hasła
        var frontendBaseUrl = _configuration["FrontendUrl"];
        if (string.IsNullOrEmpty(frontendBaseUrl))
        {
            // Logowanie błędu konfiguracji
            return StatusCode(500, new { error = "Błąd konfiguracji: nie ustawiono adresu URL frontendu do resetowania hasła." });
        }
        var resetLink = $"{frontendBaseUrl}/resetconfirm?token={identityResetToken}";

        // Wysyłka e-maila
        var subject = "Link do resetowania hasła do Twojego konta";
        var body = $"Cześć {user.UserName ?? user.Email},\n\nOtrzymaliśmy prośbę o zresetowanie hasła dla Twojego konta. Kliknij w poniższy link, aby zresetować swoje hasło:\n\n{resetLink}\n\nLink wygasa za 1 godzinę. Jeśli nie prosiłeś o resetowanie hasła, zignoruj tę wiadomość.\n\nPozdrawiamy,\nZespół Aplikacji Vibe";

        var emailSent = await _emailService.SendEmailAsync(user.Email, subject, body);

        if (emailSent)
        {
            return Ok(new { message = "Link do resetowania hasła został wysłany na Twój email." });
        }
        else
        {
            // Szczegóły błędu powinny być logowane przez EmailService, tutaj ogólny komunikat
            return StatusCode(500, new { error = "Wystąpił problem podczas wysyłania e-maila. Spróbuj ponownie później." });
        }
    }

    [HttpPost("resetPassword")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Token) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { error = "Token i nowe hasło są wymagane." });
        }

        // Znajdź token w bazie danych i sprawdź jego status (użycie, wygaśnięcie)
        var passwordResetEntity = await _dbContext.PasswordResets
                                                 .FirstOrDefaultAsync(t => t.Token == request.Token && !t.Used && t.ExpiresAt > DateTime.UtcNow);

        if (passwordResetEntity == null)
        {
            return BadRequest(new { error = "Nieprawidłowy lub wygasły token resetowania hasła." });
        }

        // Znajdź użytkownika za pomocą emaila z tokena z bazy danych
        var user = await _userManager.FindByEmailAsync(passwordResetEntity.Email);

        if (user == null)
        {
            // To nie powinno się zdarzyć, jeśli token był poprawny i rekord w bazie istnieje
            return NotFound(new { error = "Użytkownik nie znaleziony." }); 
        }

        // Zresetuj hasło za pomocą UserManager (UserManager sam zweryfikuje token)
        var resetResult = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);

        if (!resetResult.Succeeded)
        {
            var errors = new ErrorResponse { Status = 400 };
            errors.Errors["PasswordResetError"] = resetResult.Errors.Select(e => e.Description).ToList();
            // Możesz sprawdzić specyficzne błędy, np. token invalid
            return BadRequest(errors); 
        }

        // Oznacz token w Twojej bazie danych jako użyty
        passwordResetEntity.Used = true;
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Hasło zostało pomyślnie zresetowane." });
    }


}

public class DeleteUserModel
{
    public string CurrentPassword { get; set; }
}

public class SendResetLinkRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    [CustomPassword]
    [JsonPropertyName("newPassword")]
    public string NewPassword { get; set; } = string.Empty;
}
