using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Services;
namespace Projekt_Zespolowy.Controllers
{
    [ApiController]
    [Route("img")]
    public class ImageController : Controller
    {
        private readonly ImageService imageService;
        private readonly UserManager<AppUser> userManager;

        public ImageController(ImageService imageService, UserManager<AppUser> userManager) 
        {
            this.imageService = imageService;
            this.userManager = userManager;
        }

        [Authorize]
        [HttpPost("add/general")]
        public IActionResult PostGeneralImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            if (file.Length > 5242880) // 5 MB limit
                return BadRequest("File too large");

            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (string.IsNullOrEmpty(userName))
                return Unauthorized();

            var response = imageService.AddGeneralImage(file, userName);
            if (response.ResponseCode == StatusCodes.Status200OK)
                return Ok(new { url = response.ResponseBody }); // Return URL in JSON format
            else
                return StatusCode(response.ResponseCode, response.ResponseBody);
        }

        [HttpGet("get/id/{imageId}")]
        public IActionResult GetImage(int imageId)
        {
            var response = imageService.GetImage(imageId);
            if (response.ResponseCode == StatusCodes.Status404NotFound)
                return NotFound();
            return File(response.ResponseBody!.ImageData, response.ResponseBody.ContentType);
        }

        [HttpGet("get/user/{userId}")]
        public IActionResult GetUserImage(string userId)
        {
            var response = imageService.GetUserImage(userId);
            if (response.ResponseCode == StatusCodes.Status404NotFound)
                return NotFound();

            return File(response.ResponseBody!.ImageData, response.ResponseBody.ContentType);
        }

        [HttpGet("get/community/{communityId}")]
        public IActionResult GetCommunityImage(int communityId)
        {
            var response = imageService.GetCommunityImage(communityId);
            if (response.ResponseCode == StatusCodes.Status404NotFound)
                return NotFound();

            return File(response.ResponseBody!.ImageData, response.ResponseBody.ContentType);
        }

        [HttpGet("get/post/{postId}")]
        public IActionResult GetPostImage(int postId)
        {
            var response = imageService.GetPostImage(postId);
            if (response.ResponseCode == StatusCodes.Status404NotFound)
                return NotFound();

            return File(response.ResponseBody!.ImageData, response.ResponseBody.ContentType);
        }

        [Authorize]
        [HttpPost("add/user")]
        public IActionResult PostUserImage([FromForm] IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");
            // Sprawdza czy plik ma ponad 5 MB
            if (file.Length > 5242880)
                return BadRequest("File too large");

            var usr = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usr.IsNullOrEmpty())
                return Unauthorized();

            var response = imageService.AddUserImage(file, usr!);
            if (response.ResponseCode == StatusCodes.Status200OK)
                return Ok();
            else
                return StatusCode(response.ResponseCode, response.ResponseBody);
        }

        [Authorize]
        [HttpPost("add/community")]
        public IActionResult PostCommunityImage([FromForm] IFormFile file, [FromForm] int communityId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");
            // Sprawdza czy plik ma ponad 5 MB
            if (file.Length > 5242880)
                return BadRequest("File too large");

            var usr = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usr.IsNullOrEmpty())
                return Unauthorized();

            var response = imageService.AddCommunityImage(file, communityId, usr!);
            if (response.ResponseCode == StatusCodes.Status200OK)
                return Ok();
            else
                return StatusCode(response.ResponseCode, response.ResponseBody);
        }

        [Authorize]
        [HttpPost("add/post")]
        public IActionResult AddPostImage([FromForm] IFormFile file, [FromForm] int postId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");
            // Sprawdza czy plik ma ponad 5 MB
            if (file.Length > 5242880)
                return BadRequest("File too large");

            var usr = User.FindFirst(ClaimTypes.Name)?.Value;
            if (usr.IsNullOrEmpty())
                return Unauthorized();

            var response = imageService.AddPostImage(file, postId, usr!);
            if (response.ResponseCode == StatusCodes.Status200OK)
                return Ok();
            else
                return StatusCode(response.ResponseCode,response.ResponseBody);
        }
    }
}