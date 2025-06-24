using Microsoft.AspNetCore.Mvc;
using Projekt_Zespolowy.Services;
using Projekt_Zespolowy.Models;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Likes;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
namespace Projekt_Zespolowy.Controllers
{
    [ApiController]
    [Route("posts")]
    public class PostsController : Controller
    {
        private readonly PostsService postsService;
        private readonly CommunityService communityService;
        private readonly LikesService likesService;
        private readonly UserManager<AppUser> userManager;
        public PostsController(PostsService postsService, CommunityService communityService, LikesService likesService, UserManager<AppUser> userManager)
        {
            this.userManager = userManager;
            this.postsService = postsService;
            this.communityService = communityService;
            this.likesService = likesService;
        }

        [HttpGet]
        [Authorize]
        public IActionResult Posts(int page, int pageSize, string? filter = null)
        {
            int start = (page - 1) * pageSize;
            ServiceResponse<List<Post>> response;

            switch (filter)
            {
                case "new":
                    response = postsService.GetPostsSortedByNewest(start, pageSize);
                    break;
                case "popular":
                    response = postsService.GetPostsSortedByPopularity(start, pageSize);
                    break;
                case "observed":
                    var userName = User.FindFirst(ClaimTypes.Name)?.Value;
                    if (userName == null) return Unauthorized();

                    var user = userManager.FindByNameAsync(userName).Result;
                    if (user == null) return Unauthorized();

                    var userId = user.Id;
                    response = postsService.GetObservedPostsSortedByNewest(userId, start, pageSize);
                    break;
                default:
                    response = postsService.GetPostsFromRange(start, pageSize);
                    break;
            }

            if (response.ResponseCode == StatusCodes.Status204NoContent)
                return NoContent();

            var postsDTO = response.ResponseBody.Select(x => (PostDTO)x).ToList();
            return StatusCode(response.ResponseCode, postsDTO);
        }

        [HttpGet("community/{communityId}")]
        public IActionResult CommunityPosts(int communityId, int page, int pageSize, string? filter = null)
        {
            if (!communityService.GetIfCommunityExists(communityId))
                return NotFound();

            int start = (page - 1) * pageSize;
            ServiceResponse<List<Post>> response;

            switch (filter)
            {
                case "observed":
                    // Zwracamy błąd 400 z czytelnym komunikatem dla dewelopera frontendu.
                    return BadRequest("Filtr 'observed' nie jest obsługiwany dla posts/community.");
                
                case "new":
                    response = postsService.GetCommunityPostsSortedByNewest(communityId, start, pageSize);
                    break;
                case "popular":
                    response = postsService.GetCommunityPostsSortedByPopularity(communityId, start, pageSize);
                    break;
                default:
                    response = postsService.GetPostsFromRangeFromCommunity(start, pageSize, communityId);
                    break;
            }

            if (response.ResponseCode == StatusCodes.Status204NoContent)
                return NoContent();

            var postsDTO = response.ResponseBody.Select(x => (PostDTO)x).ToList();
            return StatusCode(response.ResponseCode, postsDTO);
        }
        [HttpGet("user/{authorId}")]
        public IActionResult UserPosts(string authorId, int page, int pageSize)
        {
            // Here should go a chech whether the user exists or not, but I am not sure what user it is supposed to be
            // as in newer files there showes up something called community user, and we already have app user
            // and if it is supposed to be appUser I do not really have a way to check if it exists as it would require having a database which I lack
            //if (!communityService.GetIfCommunityExists(communityId))
            //{
            //    return NotFound();
            //}
            int startPoint = (page - 1) * pageSize;
            ServiceResponse<List<Post>> response = postsService.GetPostsFromRangeFromUser(startPoint, pageSize, authorId.ToString());
            if (response.ResponseCode == StatusCodes.Status204NoContent)
                return NoContent();
            List<Post> posts = response.ResponseBody;
            List<PostDTO> postsDTO = posts.Select(x => (PostDTO)x).ToList();
            if (response.ResponseCode == StatusCodes.Status200OK)
                return Ok(postsDTO);
            else
                return StatusCode(StatusCodes.Status206PartialContent, postsDTO);
        }
        [HttpGet("{parentId}/comments")]
        public IActionResult PostComments(int parentId, int page, int pageSize)
        {
            // Here should go a chech whether the user exists or not, but I am not sure what user it is supposed to be
            // as in newer files there showes up something called community user, and we already have app user
            // and if it is supposed to be appUser I do not really have a way to check if it exists as it would require having a database which I lack
            //if (!communityService.GetIfCommunityExists(communityId))
            //{
            //    return NotFound();
            //}
            int startPoint = (page - 1) * pageSize;
            ServiceResponse<List<Post>> response = postsService.GetCommentsFromRangeFromPost(startPoint, pageSize, parentId);
            if (response.ResponseCode == StatusCodes.Status204NoContent)
                return NoContent();
            List<Post> posts = response.ResponseBody;
            List<PostDTO> postsDTO = posts.Select(x => (PostDTO)x).ToList();
            if (response.ResponseCode == StatusCodes.Status200OK)
                return Ok(postsDTO);
            else
                return StatusCode(StatusCodes.Status206PartialContent, postsDTO);
        }
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PostDTO), 200)]
        public IActionResult GetById(int id)
        {
            var result = postsService.GetById(id);
            if(result.ResponseBody == null)
            {
                return NotFound();
            }
            PostDTO postDTO = result.ResponseBody;
            return Ok(postDTO);
        }
        [Authorize]
        [HttpPost]
        public IActionResult Post([FromBody] PostDTO postDTO)
        {
            var usr = User.FindFirst(ClaimTypes.Name)?.Value;
            if(usr == null)
            {
                return Unauthorized();
            }
            postDTO.AuthorId = userManager.FindByNameAsync(usr).Result.Id;
            var response = postsService.Add(postDTO);
            if (response.ResponseCode == 201)
            {
                return Created($"/posts/{response.ResponseBody.Id}", (PostDTO)response.ResponseBody);
            }
            if (response.ResponseCode == 413)
            {
                return StatusCode(response.ResponseCode);
            }
            if (response.ResponseCode == 400)
            {
                return BadRequest("Post nie możebyć pusty!");
            }
            if (response.ResponseCode == 404)
            {
                return NotFound("Użytkownik nie istnieje!");
            }
            if (response.ResponseCode == 409)
            {
                return Conflict("Dany post już istnieje!");
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }
        [Authorize]
        [HttpPost("community/{community_id}")]
        public IActionResult PostInCommunity(int community_id, [FromBody] PostDTO postDTO)
        {
            var usr = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usr == null)
            {
                return Unauthorized();
            }
            postDTO.AuthorId = userManager.FindByNameAsync(usr).Result.Id;
            var response = postsService.AddInCommunity(community_id, postDTO);
            if (response.ResponseCode == 404)
            {
                return NotFound("Dana społeczność nie istnieje!");
            }
            if (response.ResponseCode == 201)
            {
                return Created($"/posts/{response.ResponseBody.Id}", (PostDTO)response.ResponseBody);
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }
        [Authorize]
        [HttpPost("{parent_id}")]
        public IActionResult PostAsComment(int parent_id, [FromBody] PostDTO postDTO)
        {
            var usr = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usr == null)
            {
                return Unauthorized();
            }
            postDTO.AuthorId = userManager.FindByNameAsync(usr).Result.Id;
            var response = postsService.AddComment(parent_id, postDTO);
            if (response.ResponseCode == 404)
            {
                return NotFound("Post na który próbujesz odpowiedzieć został usunięty lub nie istnieje!");
            }
            if (response.ResponseCode == 201)
            {
                return Created($"/posts/{response.ResponseBody.Id}", (PostDTO)response.ResponseBody);
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }
        [Authorize]
        [HttpPut]
        public IActionResult Put([FromBody] PostDTO postDTO)
        {
            var usr = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usr == null)
            {
                return Unauthorized();
            }
            var usrId = userManager.FindByNameAsync(usr).Result.Id;
            if(postsService.GetById(postDTO.Id).ResponseBody.AppUserId != usrId)
            {
                return Unauthorized();
            }
            var response = postsService.Update(postDTO);
            if (response.ResponseCode == 200)
            {
                return Ok($"/posts/{response.ResponseBody.Id}");
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }
        [Authorize]
        [HttpPut("[action]/{id}")]
        public IActionResult Delete(int id)
        {
            var usr = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usr == null)
            {
                return Unauthorized();
            }
            var usrId = userManager.FindByNameAsync(usr).Result.Id;
            if (postsService.GetById(id).ResponseBody.AppUserId != usrId)
            {
                return Unauthorized();
            }
            var response = postsService.Delete(id);
            if (response.ResponseCode == 200)
            {
                return Ok();
            }
            if (response.ResponseCode == 404)
            {
                return NotFound("Post który próbujesz usunąć, nie istnieje!");
            }
            if (response.ResponseCode == 409)
            {
                return Conflict("Ten post jest już usunięty!");
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }
        [Authorize]
        [HttpPut("[action]/{id}")]
        public IActionResult UndoDelete(int id)
        {
            var usr = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usr == null)
            {
                return Unauthorized();
            }
            var usrId = userManager.FindByNameAsync(usr).Result.Id;
            if (postsService.GetByIdWithDeleted(id).ResponseBody.AppUserId != usrId)
            {
                return Unauthorized();
            }
            var response = postsService.UndoDelete(id);
            if (response.ResponseCode == 200)
            {
                return NoContent();
            }
            if (response.ResponseCode == 404)
            {
                return NotFound("Post który próbujesz przywrócić, nigdy nie istniał!");
            }
            if (response.ResponseCode == 409)
            {
                return Conflict("Ten post nie jest usunięty!");
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }
        [Authorize]
        [HttpPost("{postId}/Like")]
        public IActionResult GiveReaction(int postId, [FromBody] LikeDTO like)
        {
            var usr = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usr == null)
            {
                return Unauthorized();
            }
            like.AppUserId = userManager.FindByNameAsync(usr).Result.Id;
            var post = this.postsService.GetById(postId);
            if(post.ResponseCode == StatusCodes.Status404NotFound || post.ResponseBody.IsDeleted)
            {
                return NotFound("Post nie istnieje lub został usunięty");
            }
            like.PostId = postId;
            var sr = likesService.Add(like);
            return StatusCode(sr.ResponseCode);
        }
        [Authorize]
        [HttpPost("{postId}/unlike")]
        public IActionResult RemoveReaction(int postId)
        {
            var usr = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usr == null)
            {
                return Unauthorized();
            }
            var AppUserId = userManager.FindByNameAsync(usr).Result.Id;
            var post = this.postsService.GetById(postId);
            if (post.ResponseCode == StatusCodes.Status404NotFound || post.ResponseBody.IsDeleted)
            {
                return NotFound("Post nie istnieje lub został usunięty");
            }
            if(post.ResponseBody.Likes.FirstOrDefault(p => p.AppUserId == AppUserId) == default)
            {
                return NotFound("Nie pozostawiono reakcji na tego posta");
            }
            Like like = post.ResponseBody.Likes.FirstOrDefault(p => p.AppUserId == AppUserId);
            var sr = likesService.Remove(like);
            return StatusCode(sr.ResponseCode);
        }
        [HttpGet("{postId}/{reactionId}/Nr")]
        public IActionResult GetReactionCount(int postId, int reactionId)
        {
            var post = this.postsService.GetById(postId);
            if(post.ResponseCode == StatusCodes.Status404NotFound || post.ResponseBody.IsDeleted)
            {
                return NotFound();
            }
            var reactionCount = this.likesService.GetOfPostCountByType(postId, reactionId);
            return StatusCode(reactionCount.ResponseCode, reactionCount.ResponseBody);
        }
        [HttpGet("{postId}/Reactions/Nr")]
        public IActionResult GetReactionCount(int postId)
        {
            var post = this.postsService.GetById(postId);
            if(post.ResponseCode == StatusCodes.Status404NotFound || post.ResponseBody.IsDeleted)
            {
                return NotFound();
            }
            var reactionCount = this.likesService.GetOfPostCount(postId);
            return StatusCode(reactionCount.ResponseCode, reactionCount.ResponseBody);
        }
        [HttpGet("{postId}/{reactionId}")]
        public IActionResult GetReaction(int postId, int reactionId)
        {
            var post = this.postsService.GetById(postId);
            if(post.ResponseCode == StatusCodes.Status404NotFound || post.ResponseBody.IsDeleted)
            {
                return NotFound();
            }
            var likes = this.likesService.GetOfPostByType(postId, reactionId);
            return StatusCode(likes.ResponseCode, likes.ResponseBody.Select(x => (LikeDTO)x));
        }
        [HttpGet("{postId}/Reactions")]
        public IActionResult GetReaction(int postId)
        {
            var post = this.postsService.GetById(postId);
            if(post.ResponseCode == StatusCodes.Status404NotFound || post.ResponseBody.IsDeleted)
            {
                return NotFound();
            }
            var likes = this.likesService.GetOfPost(postId);
            return StatusCode(likes.ResponseCode, likes.ResponseBody.Select(x=>(LikeDTO)x));
        }
    }
}