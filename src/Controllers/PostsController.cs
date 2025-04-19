using Microsoft.AspNetCore.Mvc;
using Projekt_Zespolowy.Services;
using Projekt_Zespolowy.Posts;

namespace Projekt_Zespolowy.Controllers
{
    [ApiController]
    [Route("[controller]")]
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
            try
            {
                List<Post> posts = postsService.GetPostsFromRange(startPoint, pageSize);
                List<PostDTO> postsDTO = new List<PostDTO>();
                foreach (Post post in posts)
                {
                    postsDTO.Add(post);
                }
                return Ok(postsDTO);
            }
            catch (NoContentException)
            {
                return NoContent();
            }
            catch (PartialContentException<List<Post>> e)
            {
                List<PostDTO> posts = new List<PostDTO>();
                for (int i = 0; i < e.partialContent.Count; i++)
                {
                    posts.Add(e.partialContent[i]);
                }
                return StatusCode(StatusCodes.Status206PartialContent, posts);
            }
        }
        [HttpGet("community/{communityId}")]
        public IActionResult CommunityPosts(int communityId, int page, int pageSize) 
        {
            if(!communityService.GetIfCommunityExists(communityId))
            {
                NotFound();
            }
            int startPoint = (page - 1) * pageSize;
            try
            {
                List<Post> posts = postsService.GetPostsFromRangeFromCommunity(startPoint, pageSize, communityId);
                List<PostDTO> postsDTO = new List<PostDTO>();
                foreach (Post post in posts)
                {
                    postsDTO.Add(post);
                }
                return Ok(postsDTO);
            }
            catch (NoContentException)
            {
                return NoContent();
            }
            catch (PartialContentException<List<Post>> e)
            {
                List<PostDTO> posts = new List<PostDTO>();
                for (int i = 0; i < e.partialContent.Count; i++)
                {
                    posts.Add(e.partialContent[i]);
                }
                return StatusCode(StatusCodes.Status206PartialContent, posts);
            }
        }
        [HttpPost()]
        public IActionResult Post([FromBody] PostDTO postDTO)
        {
            postsService.Add(postDTO);
            return Created($"/posts/{postDTO.Id}", postDTO);

        }
    }
}
