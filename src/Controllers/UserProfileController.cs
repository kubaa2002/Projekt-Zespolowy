using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using System;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;
using Projekt_Zespolowy.UserProfile;

namespace Projekt_Zespolowy.Controllers;

[ApiController]
[Route("user")]
public class UserProfileController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly AppDbContext _dbContext;

    public UserProfileController(UserManager<AppUser> userManager, AppDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    [Authorize]
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetUserProfile(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null || user.IsDeleted)
            return NotFound(new { message = "Użytkownik nie istnieje" });

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var isFollowing = await _dbContext.Followers.AnyAsync(f =>
                f.FollowerId == currentUserId && f.FollowingId == user.Id);

        var isFollower = await _dbContext.Followers.AnyAsync(f =>
                f.FollowerId == user.Id && f.FollowingId == currentUserId);

        var profile = new UserProfileDTo
        {
            Id = user.Id,
            UserName = user.UserName ?? "",
            CreatedAt = user.LockoutEnd ?? DateTimeOffset.UtcNow,
            IsMe = currentUserId == user.Id,
            IsFollowing = isFollowing,
            IsFollower = isFollower,
            FollowersCount = await _dbContext.Followers.CountAsync(f => f.FollowingId == user.Id),
            FollowingCount = await _dbContext.Followers.CountAsync(f => f.FollowerId == user.Id),
            CommunitiesCount = await _dbContext.CommunityMembers.CountAsync(cm => cm.AppUserId == user.Id)
        };

        return Ok(profile);
    }

    [Authorize]
    [HttpGet("{userId}/fans")]
    public async Task<IActionResult> GetFans(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        var followerIds = await _dbContext.Followers
            .Where(f => f.FollowingId == userId)
            .Select(f => f.FollowerId)
            .ToListAsync();

        if (!followerIds.Any())
            return NoContent();

        var fans = await _userManager.Users
            .Where(u => followerIds.Contains(u.Id))
            .Select(u => new { u.Id, u.UserName })
            .ToListAsync();

        return Ok(fans);
    }

    [Authorize]
    [HttpGet("{userId}/follows")]
    public async Task<IActionResult> GetFollows(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        var followingIds = await _dbContext.Followers
            .Where(f => f.FollowerId == userId)
            .Select(f => f.FollowingId)
            .ToListAsync();

        if (!followingIds.Any())
            return NoContent();

        var follows = await _userManager.Users
            .Where(u => followingIds.Contains(u.Id))
            .Select(u => new { u.Id, u.UserName })
            .ToListAsync();

        return Ok(follows);
    }

    [Authorize]
    [HttpGet("{userId}/communities")]
    public async Task<IActionResult> GetCommunities(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return NotFound();

        var communityIds = await _dbContext.CommunityMembers
            .Where(cm => cm.AppUserId == userId)
            .Select(cm => cm.CommunityId)
            .ToListAsync();

        if (!communityIds.Any())
            return NoContent();

        var communities = await _dbContext.Communities
            .Where(c => communityIds.Contains(c.Id))
            .Select(c => new { c.Id, c.Name, MemberCount = _dbContext.CommunityMembers.Count(cm => cm.CommunityId == c.Id)   })
            .ToListAsync();

        return Ok(communities);
    }

    [Authorize]
    [HttpPost("follow/{userId}")]
    public async Task<IActionResult> FollowUser(string userId)
    {

        var currentUser = User.FindFirstValue(ClaimTypes.Name);
        var currentUserId = _userManager.Users
            .Where(u => u.UserName == currentUser)
            .Select(u => u.Id)
            .FirstOrDefault();
        if (currentUserId == null)
        {
            return Unauthorized(new { error = "Brak autoryzacji." });
        }

      
        if (currentUserId == userId)
        {
            return BadRequest(new { error = "Nie możesz obserwować samego siebie." });
        }

       
        var targetUser = await _userManager.FindByIdAsync(userId);
        if (targetUser == null)
        {
            return NotFound(new { error = "Użytkownik nie istnieje." });
        }

        var alreadyFollowing = await _dbContext.Followers
            .AnyAsync(f => f.FollowerId == currentUserId && f.FollowingId == userId);
        if (alreadyFollowing)
        {
            return Ok(new { message = "Już obserwujesz tego użytkownika." });
        }

      
        var follower = new Follower
        {
            FollowerId = currentUserId,
            FollowingId = userId,
            CreatedDateTime = DateTimeOffset.UtcNow
        };

        _dbContext.Followers.Add(follower);
        await _dbContext.SaveChangesAsync();

        return StatusCode(StatusCodes.Status201Created, new { message = "Użytkownik zaobserwowany." });
    }

    [Authorize]
    [HttpDelete("unfollow/{userId}")]
    public async Task<IActionResult> UnfollowUser(string userId)
    {

        var currentUser = User.FindFirstValue(ClaimTypes.Name);
        var currentUserId = _userManager.Users
            .Where(u => u.UserName == currentUser)
            .Select(u => u.Id)
            .FirstOrDefault();
        if (currentUserId == null)
        {
            return Unauthorized(new { error = "Brak autoryzacji." });
        }


        var targetUser = await _userManager.FindByIdAsync(userId);
        if (targetUser == null)
        {
            return NotFound(new { error = "Użytkownik nie istnieje." });
        }


        var follow = await _dbContext.Followers
            .SingleOrDefaultAsync(f => f.FollowerId == currentUserId && f.FollowingId == userId);
        if (follow == null)
        {
            return NotFound(new { error = "Nie obserwujesz tego użytkownika." });
        }


        _dbContext.Followers.Remove(follow);
        await _dbContext.SaveChangesAsync();

        return Ok(new { message = "Przestałeś obserwować użytkownika." });
    }


}
