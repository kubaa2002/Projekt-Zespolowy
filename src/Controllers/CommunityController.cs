using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;
using System.Security.Claims;

namespace Projekt_Zespolowy.Controllers;

[ApiController]
[Route("community")]
[Authorize]
public class CommunityController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly UserManager<AppUser> _userManager;

    public CommunityController(AppDbContext dbContext, UserManager<AppUser> userManager)
    {
        _dbContext = dbContext;
        _userManager = userManager;
    }

    private async Task<AppUser?> GetCurrentUser()
    {
        var userName = User.FindFirstValue(ClaimTypes.Name);
        return await _userManager.FindByNameAsync(userName!);
    }

    [HttpPost("join/{communityId}")]
    public async Task<IActionResult> JoinCommunity(int communityId)
    {
        var community = await _dbContext.Communities.FindAsync(communityId);
        if (community == null) return NotFound();

        var user = await GetCurrentUser();
        if (user == null) return Unauthorized();

        var alreadyMember = await _dbContext.CommunityMembers
            .AnyAsync(cm => cm.CommunityId == communityId && cm.UserId == user.Id);

        if (!alreadyMember)
        {
            _dbContext.CommunityMembers.Add(new CommunityMember
            {
                CommunityId = communityId,
                UserId = user.Id,
                Role = "member",
                JoinedDateTime = DateTimeOffset.UtcNow
            });

            await _dbContext.SaveChangesAsync();
        }

        return StatusCode(201);
    }

    [HttpPost("left/{communityId}")]
    public async Task<IActionResult> LeaveCommunity(int communityId)
    {
        var community = await _dbContext.Communities.FindAsync(communityId);
        if (community == null) return NotFound();

        var user = await GetCurrentUser();
        if (user == null) return Unauthorized();

        var membership = await _dbContext.CommunityMembers
            .FirstOrDefaultAsync(cm => cm.CommunityId == communityId && cm.UserId == user.Id);

        if (membership == null) return NotFound();

        _dbContext.CommunityMembers.Remove(membership);
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("{communityId}")]
    public async Task<IActionResult> GetCommunity(int communityId)
    {
        var community = await _dbContext.Communities.FindAsync(communityId);
        if (community == null) return NotFound();

        var user = await GetCurrentUser();
        if (user == null) return Unauthorized();

        var member = await _dbContext.CommunityMembers
            .FirstOrDefaultAsync(cm => cm.CommunityId == communityId && cm.UserId == user.Id);

        return Ok(new
        {
            name = community.Name,
            description = community.Description,
            createdDate = community.CreatedDateTime,
            isMember = member != null,
            joinedDate = member?.JoinedDateTime,
            role = member?.Role
        });
    }

    [HttpPost("edit/{communityId}")]
    public async Task<IActionResult> EditCommunity(int communityId, [FromBody] EditCommunityDto dto)
    {
        if (dto.Description.Length > 500) return BadRequest("Opis jest za długi.");

        var community = await _dbContext.Communities.FindAsync(communityId);
        if (community == null) return NotFound();

        var user = await GetCurrentUser();
        if (user == null) return Unauthorized();

        var member = await _dbContext.CommunityMembers
            .FirstOrDefaultAsync(cm => cm.CommunityId == communityId && cm.UserId == user.Id);

        if (member == null || (member.Role != "owner" && member.Role != "moderator"))
            return Forbid();

        community.Description = dto.Description;
        await _dbContext.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("new")]
    public async Task<IActionResult> CreateCommunity([FromBody] CreateCommunityDto dto)
    {
        if (dto.Name.Length > 50 || dto.Description.Length > 500)
            return StatusCode(413, "Nazwa lub opis są za długie.");
        if (dto.Name.Length < 1 || string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Nazwa community jest wymagana.");

        var nameExists = await _dbContext.Communities.AnyAsync(c => c.Name == dto.Name);
        if (nameExists) return BadRequest("Nazwa community już istnieje.");

        var user = await GetCurrentUser();
        if (user == null) return Unauthorized();

        var community = new Community
        {
            Name = dto.Name,
            Description = dto.Description,
            CreatedDateTime = DateTimeOffset.UtcNow
        };

        _dbContext.Communities.Add(community);
        await _dbContext.SaveChangesAsync();

        _dbContext.CommunityMembers.Add(new CommunityMember
        {
            CommunityId = community.Id,
            UserId = user.Id,
            Role = "owner",
            JoinedDateTime = DateTimeOffset.UtcNow
        });

        await _dbContext.SaveChangesAsync();

        return StatusCode(201);
    }
}

public class CreateCommunityDto
{
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public class EditCommunityDto
{
    public string Description { get; set; } = string.Empty;
}
