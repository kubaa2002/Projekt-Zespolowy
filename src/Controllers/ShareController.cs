using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Projekt_Zespolowy.Services;
using Microsoft.AspNetCore.Authorization;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;


namespace Projekt_Zespolowy.Controllers
{
    [ApiController]
    [Route("share")]
    public class ShareController : Controller
    {
        private readonly SharingService sharingService;
        private readonly UserManager<AppUser> userManager;

        public ShareController(SharingService sharingService, UserManager<AppUser> userManager)
        {
            this.userManager = userManager;
            this.sharingService = sharingService;
        }

        [Authorize]
        [HttpPost("{postId}")]
        public IActionResult SharePost(int postId)
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (userName == null)
                return Unauthorized();
            var user = userManager.FindByNameAsync(userName).Result;
            if (user == null)
                return Unauthorized();
            string userId = user.Id;
            var response = sharingService.SharePost(postId, userId);

            if (response.ResponseCode == StatusCodes.Status201Created)
                return Created($"/shares/{postId}/{userId}", (ShareDTO)response.ResponseBody!);
            if (response.ResponseCode == StatusCodes.Status409Conflict)
                return Conflict("Dany użytkownik udostępnił już ten post!");
            if (response.ResponseCode == StatusCodes.Status400BadRequest)
                return BadRequest("Użytkownik nie może udostępnić swoje posta");

            return NotFound("Użytkownik lub post nie istnieją!");
        }

        [HttpGet("[action]/{userId}")]
        public IActionResult GetSharedPostsIds(string userId)
        {
            var response = sharingService.GetSharedPostsIds(userId);
            if (response.ResponseCode == 404)
                return NotFound("User does not exist!");

            if (response.ResponseCode == 204)
                return NoContent();

            return Ok(response.ResponseBody);
        }

        //[HttpGet("[action]/{userId}")]
        //public IActionResult GetSharedPosts(string userId)
        //{
        //    ICollection<int>? response = sharingService.GetSharedPostsIds(userId);
        //    if (response == null)
        //        return NotFound("User does not exist!");

        //    if (response.Count() == 0)
        //        return NoContent();

        //    else return Ok(response);
        //}

        [Authorize]
        [HttpDelete("[action]/{postId}")]
        public IActionResult DeleteShare(int postId)
        {
            var userName = User.FindFirst(ClaimTypes.Name)?.Value;
            if (userName == null)
                return Unauthorized();
            var user = userManager.FindByNameAsync(userName).Result;
            if (user == null)
                return Unauthorized();
            string userId = user.Id;
            var response = sharingService.DeleteShare(postId, userId);
            if (response.ResponseCode == 404)
                return NotFound(response.ResponseBody);

            else return NoContent();
        }
    }
}
