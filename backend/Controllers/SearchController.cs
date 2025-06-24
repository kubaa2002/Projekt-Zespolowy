using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;

namespace Projekt_Zespolowy.Controllers;



    [ApiController]
    [Route("search")]
    public class SearchController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SearchController(AppDbContext context)
        {
            _context = context;
        }


        [HttpGet("community/{community_id}")]
        public async Task<IActionResult> SearchCommunityPosts(int community_id, [FromQuery] string q, [FromQuery] int? start = 0, [FromQuery] int? amount = 10)
        {

            var communityExists = await _context.Communities.AnyAsync(c => c.Id == community_id);
            if (!communityExists)
            {
                return NotFound();
            }

            var query = _context.Posts
                .Where(p => !p.IsDeleted)
                .Where(p => p.CommunityId == community_id)
                .Include(p => p.Author)
                .Include(p => p.Likes)
                .ThenInclude(l => l.Reaction)
                .GroupJoin(_context.Likes,
                    post => post.Id,
                    like => like.PostId,
                    (post, likes) => new
                    {
                        Post = post,
                        LikeCount = likes.Count()
                    })
                .Where(p => p.Post.Content.Contains(q))
                .OrderByDescending(p => p.LikeCount);

            var results = await query
                .Skip(start ?? 0)
                .Take(amount ?? 10)
                .Select(p => (PostDTO)p.Post)
                .ToListAsync();

            if (!results.Any())
            {
                return NoContent();
            }

            return Ok(results);
        }


        [HttpGet("user/{user_id}")]
        public async Task<IActionResult> SearchUserPosts(string user_id, [FromQuery] string q, [FromQuery] int? start = 0, [FromQuery] int? amount = 10)
        {

            var userExists = await _context.Users.AnyAsync(u => u.Id == user_id);
            if (!userExists)
            {
                return NotFound();
            }

            var query = _context.Posts
                .Where(p => !p.IsDeleted)
                .Where(p => p.AppUserId == user_id)
                .Include(p => p.Author)
                .Include(p => p.Likes)
                .ThenInclude(l => l.Reaction)
                .GroupJoin(_context.Likes,
                    post => post.Id,
                    like => like.PostId,
                    (post, likes) => new
                    {
                        Post = post,
                        LikeCount = likes.Count()
                    })
                .Where(p => p.Post.Content.Contains(q))
                .OrderByDescending(p => p.LikeCount);

            var results = await query
                .Skip(start ?? 0)
                .Take(amount ?? 10)
                .Select(p => (PostDTO)p.Post)
                .ToListAsync();
        if (!results.Any())
            {
                return NoContent();
            }

            return Ok(results);
        }


        [HttpGet("user")]
        public async Task<IActionResult> SearchUsers([FromQuery] string q, [FromQuery] int? start = 0, [FromQuery] int? amount = 10)
        {
            var query = _context.Users
                .GroupJoin(_context.Followers,
                    user => user.Id,
                    follower => follower.FollowingId,
                    (user, followers) => new
                    {
                        User = user,
                        FollowerCount = followers.Count()
                    })
                .Where(u => !u.User.IsDeleted)
                .Where(u => u.User.UserName!.Contains(q))
                .OrderByDescending(u => u.FollowerCount);

            var results = await query
                .Skip(start ?? 0)
                .Take(amount ?? 10)
                .Select(u => new UserDTO
                {
                    CreatedAt = u.User.CreatedAt,
                    Id = u.User.Id,
                    Email = u.User.Email,
                    UserName = u.User.UserName,
                })
                .ToListAsync();

            if (!results.Any())
            {
                return NoContent();
            }

            return Ok(results);
        }


        [HttpGet("community")]
        public async Task<IActionResult> SearchCommunities([FromQuery] string q, [FromQuery] int? start = 0, [FromQuery] int? amount = 10)
        {
        var query = _context.Communities
            .GroupJoin(_context.CommunityMembers,
                community => community.Id,
                member => member.CommunityId,
                (community, members) => new
                {
                    Community = community,
                    MemberCount = members.Count()
                })
            .Where(c => c.Community.Name.Contains(q))
            .OrderByDescending(c => c.MemberCount);

        var results = await query
                .Skip(start ?? 0)
                .Take(amount ?? 10)
                .Select(c => c.Community)
                .ToListAsync();

            if (!results.Any())
            {
                return NoContent();
            }

            return Ok(results);
        }

        [HttpGet("communities")]
        public async Task<IActionResult> GetAllCommunities([FromQuery] int? start = 0, [FromQuery] int? amount = 10)
        {
            var query = _context.Communities
                .GroupJoin(_context.CommunityMembers,
                    community => community.Id,
                    member => member.CommunityId,
                    (community, members) => new
                    {
                        Community = community,
                        MemberCount = members.Count()
                    })
                .OrderByDescending(c => c.MemberCount);

            var results = await query
                .Skip(start ?? 0)
                .Take(amount ?? 10)
                .Select(c => c.Community)
                .ToListAsync();

            if (!results.Any())
            {
                return NoContent();
            }

            return Ok(results);
        }
    }