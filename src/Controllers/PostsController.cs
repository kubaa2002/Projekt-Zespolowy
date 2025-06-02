using Microsoft.AspNetCore.Mvc;
using Projekt_Zespolowy.Services;
using Projekt_Zespolowy.Posts;
using Projekt_Zespolowy.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Likes;

namespace Projekt_Zespolowy.Controllers
{
    [ApiController]
    [Route("posts")]
    public class PostsController : Controller
    {
        PostsService postsService;
        CommunityService communityService;
        LikesService likesService;
        public PostsController(PostsService postsService, CommunityService communityService, LikesService likesService) 
        {
            this.postsService = postsService;
            this.communityService = communityService;
            this.likesService = likesService;
        }
        [HttpGet]
        [ProducesResponseType<List<PostDTO>>(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType<List<PostDTO>>(StatusCodes.Status206PartialContent)]
        public IActionResult Posts(int page, int pageSize)
        {
            int startPoint = (page-1) * pageSize;
            ServiceResponse<List<Post>> response = postsService.GetPostsFromRange(startPoint, pageSize);
            if (response.ResponseCode == StatusCodes.Status204NoContent)
                return NoContent();
            List <Post> posts = response.ResponseBody;
            List<PostDTO> postsDTO = posts.Select(x => (PostDTO)x).ToList();
            if(response.ResponseCode == StatusCodes.Status200OK)
                return Ok(postsDTO);
            else
                return StatusCode(StatusCodes.Status206PartialContent, postsDTO);
        }
        [HttpGet("community/{communityId}")]
        public IActionResult CommunityPosts(int communityId, int page, int pageSize) 
        {
            if(!communityService.GetIfCommunityExists(communityId))
            {
                return NotFound();
            }
            int startPoint = (page - 1) * pageSize;
            ServiceResponse<List<Post>> response = postsService.GetPostsFromRangeFromCommunity(startPoint, pageSize, communityId);
            if (response.ResponseCode == StatusCodes.Status204NoContent)
                return NoContent();
            List<Post> posts = response.ResponseBody;
            List<PostDTO> postsDTO = posts.Select(x => (PostDTO)x).ToList();
            if(response.ResponseCode == StatusCodes.Status200OK)
                return Ok(postsDTO);
            else
                return StatusCode(StatusCodes.Status206PartialContent, postsDTO);
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
        [HttpGet("[action]")]
        [ProducesResponseType(typeof(IEnumerable<PostDTO>), 200)]
        public IActionResult GetAll()
        {
            var result = postsService.GetAll();
            return result.ResponseBody != null ? Ok(result) : NoContent();
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PostDTO), 200)]
        public IActionResult GetById(int id)
        {
            var result = postsService.GetById(id);
            PostDTO postDTO = result.ResponseBody;
            return result.ResponseBody != null ? Ok(postDTO) : NotFound(); 
        }

        [HttpPost]
        public IActionResult Post([FromBody] PostDTO postDTO)
        {
            var response = postsService.Add(postDTO);
            if (response.ResponseCode == 201)
            {
                return Created($"/posts/{postDTO.Id}", postDTO);
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }

        [HttpPost("community/{community_id}")]
        public IActionResult PostInCommunity(int community_id, [FromBody] PostDTO postDTO)
        {
            var response = postsService.AddInCommunity(community_id, postDTO);
            if(response.ResponseCode == 404)
            {
                return NotFound("Dana społeczność nie istnieje!");
            }
            if (response.ResponseCode == 201)
            {
                return Created($"/posts/{postDTO.Id}", postDTO);
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }
        [HttpPost("{parent_id}")]
        public IActionResult PostAsComment(int parent_id, [FromBody] PostDTO postDTO)
        {
            var response = postsService.AddComment(parent_id, postDTO);
            if (response.ResponseCode == 404)
            {
                return NotFound("Post na który próbujesz odpowiedzieć został usunięty lub nie istnieje!");
            }
            if (response.ResponseCode == 201)
            {
                return Created($"/posts/{postDTO.Id}", postDTO);
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }
        [HttpPut]
        public IActionResult Put([FromBody] PostDTO postDTO)
        {
            var response = postsService.Update(postDTO);
            if (response.ResponseCode == 200)
            {
                return Ok($"/posts/{postDTO.Id}");
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }

        [HttpPut("[action]/{id}")]
        public IActionResult Delete(int id, [FromBody] PostDTO post)
        {
            var response = postsService.Delete(id ,post);
            if (response.ResponseCode == 200)
            {
                return NoContent();
            }
            if (response.ResponseCode == 404)
            {
                return NotFound("Post który próbujesz usunąć, nie istnieje!");
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }
        [HttpPut("[action]/{id}")]
        public IActionResult UndoDelete(int id, [FromBody] PostDTO post)
        {
            var response = postsService.UndoDelete(id, post);
            if (response.ResponseCode == 200)
            {
                return NoContent();
            }
            if (response.ResponseCode == 404)
            {
                return NotFound("Post który próbujesz przywrócić, nigdy nie istniał!");
            }
            else
            {
                return StatusCode(response.ResponseCode);
            }
        }
        [HttpPost("{postId}/Like")]
        public IActionResult GiveReaction(int postId, [FromBody] Like like)
        {
            var post = this.postsService.GetById(postId);
            if(post.ResponseCode == StatusCodes.Status404NotFound || post.ResponseBody.IsDeleted)
            {
                return NotFound("Post nie istnieje lub został usunięty");
            }
            like.PostId = postId;
            var sr = likesService.Add(like);
            return StatusCode(sr.ResponseCode);
        }
        [HttpGet("{postId}/{reactionType}/Nr")]
        public IActionResult GetReactionCount(int postId, ReactionType reactionType)
        {
            if(this.postsService.GetById(postId).ResponseCode == StatusCodes.Status404NotFound)
            {
                return NotFound();
            }
            var reactionCount = this.likesService.GetOfPostCountByType(postId, reactionType);
            return StatusCode(reactionCount.ResponseCode, reactionCount.ResponseBody);
        }
        [HttpGet("{postId}/Reactions/Nr")]
        public IActionResult GetReactionCount(int postId)
        {
            if(this.postsService.GetById(postId).ResponseCode == StatusCodes.Status404NotFound)
            {
                return NotFound();
            }
            var reactionCount = this.likesService.GetOfPostCount(postId);
            return StatusCode(reactionCount.ResponseCode, reactionCount.ResponseBody);
        }
        [HttpGet("{postId}/{reactionType}")]
        public IActionResult GetReaction(int postId, ReactionType reactionType)
        {
            if(this.postsService.GetById(postId).ResponseCode == StatusCodes.Status404NotFound)
            {
                return NotFound();
            }
            var likes = this.likesService.GetOfPostByType(postId, reactionType);
            return StatusCode(likes.ResponseCode, likes.ResponseBody.Select(x => (LikeDTO)x));
        }
        [HttpGet("{postId}/Reactions")]
        public IActionResult GetReaction(int postId)
        {
            if(this.postsService.GetById(postId).ResponseCode == StatusCodes.Status404NotFound)
            {
                return NotFound();
            }
            var likes = this.likesService.GetOfPost(postId);
            return StatusCode(likes.ResponseCode, likes.ResponseBody.Select(x=>(LikeDTO)x));
        }
    }
}
