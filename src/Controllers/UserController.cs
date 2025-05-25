using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Projekt_Zespolowy.Authentication;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Projekt_Zespolowy.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IConfiguration _configuration;
    private readonly AppDbContext _dbContext;

    public UserController(UserManager<AppUser> userManager, IConfiguration configuration, AppDbContext dbContext)
    {
        _userManager = userManager;
        _configuration = configuration;
        _dbContext = dbContext;
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
                errors.Errors["UserName"] = new List<string> { "Pseudonim zajęty" };
                return BadRequest(errors);
            }

            existedUser = await _userManager.FindByEmailAsync(model.Email);
            if (existedUser != null)
            {
                errors.Errors["Email"] = new List<string> { "Nie można użyć tego adresu email" };
                return BadRequest(errors);
            }

            var user = new AppUser()
            {
                UserName = model.UserName,
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString()
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
        return Unauthorized(ModelState);
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

        return Ok(new { userName = user.UserName, email = user.Email });

    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordModel model)
    {
        var userName = User.FindFirst(ClaimTypes.Name)?.Value;
        if (string.IsNullOrEmpty(userName))
        {
            return Unauthorized(new { message = "Nie udało się zidentyfikować użytkownika." });
        }

        var user = await _userManager.FindByNameAsync(userName);
        if (user == null)
        {
            return Unauthorized(new { message = "Użytkownik nie istnieje." });
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
}