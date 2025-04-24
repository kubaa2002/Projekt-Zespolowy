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
                ServiceResponse<List<Post>> response = postsService.GetPostsFromRange(startPoint, pageSize);
                List <Post> posts = response.ResponseBody;
                List<PostDTO> postsDTO = new List<PostDTO>();
                foreach (Post post in posts)
                {
                    postsDTO.Add(post);
                }
                if(response.ResponseCode == StatusCodes.Status200OK)
                    return Ok(postsDTO);
                else
                    return StatusCode(StatusCodes.Status206PartialContent, posts);
            }
            catch (NoContentException)
            {
                return NoContent();
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
                ServiceResponse<List<Post>> response = postsService.GetPostsFromRangeFromCommunity(startPoint, pageSize, communityId);
                List<Post> posts = response.ResponseBody;
                List<PostDTO> postsDTO = new List<PostDTO>();
                foreach (Post post in posts)
                {
                    postsDTO.Add(post);
                }
                if(response.ResponseCode == StatusCodes.Status200OK)
                    return Ok(postsDTO);
                else
                    return StatusCode(StatusCodes.Status206PartialContent, posts);
            }
            catch (NoContentException)
            {
                return NoContent();
            }
        }
    }
}
