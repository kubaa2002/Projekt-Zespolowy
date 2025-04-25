using Microsoft.AspNetCore.Mvc;
using Projekt_Zespolowy.Services;
using Projekt_Zespolowy.Posts;
using Microsoft.AspNetCore.Http.HttpResults;

namespace Projekt_Zespolowy.Controllers
{
    [ApiController]
    [Route("posts")]
    public class PostsController : Controller
    {
        PostsService postsService;
        CommunityService communityService;
        public PostsController(PostsService postsService, CommunityService communityService) 
        {
            this.postsService = postsService;
            this.communityService = communityService;
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
        public IActionResult UserPosts(int authorId, int page, int pageSize)
        {
            // Here should go a chech whether the user exists or not, but I am not sure what user it is supposed to be
            // as in newer files there showes up something called community user, and we already have app user
            // and if it is supposed to be appUser I do not really have a way to check if it exists as it would require having a database which I lack
            //if (!communityService.GetIfCommunityExists(communityId))
            //{
            //    return NotFound();
            //}
            int startPoint = (page - 1) * pageSize;
            ServiceResponse<List<Post>> response = postsService.GetPostsFromRangeFromUser(startPoint, pageSize, authorId);
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
            return result.ResponseBody != null ? Ok(result) : NotFound(); 
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

        [HttpGet("[action]")]
        [ProducesResponseType(typeof(IEnumerable<PostDTO>), 200)]
        public IActionResult GetAll()
        {
            var result = postsService.GetAll();
            return Ok(result);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(PostDTO), 200)]
        public IActionResult GetById(int id)
        {
            var result = postsService.GetById(id);
            return result != null ? Ok(result) : NotFound(); 
        }

        [HttpDelete("{id}")]
        public IActionResult Delete([FromBody] PostDTO post)
        {
            postsService.Remove(post);
            return NoContent();
        }
    }
}
