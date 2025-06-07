using Microsoft.AspNetCore.Mvc;
using Projekt_Zespolowy.Services;

namespace Projekt_Zespolowy.Controllers
{
    [ApiController]
    [Route("share")]
    public class ShareController : Controller
    {
        SharingService sharingService;

        public ShareController(SharingService sharingService)
        {
            this.sharingService = sharingService;
        }

        [HttpPost("{postId}/{userId}")]
        public IActionResult SharePost(int postId, string userId)
        {
            var response = sharingService.SharePost(postId, userId);

            if (response.ResponseCode == 201)
                return Created($"/shares/{postId}/{userId}", response.ResponseBody);
            
            if (response.ResponseCode == StatusCodes.Status409Conflict)
                return Conflict("Dany użytkownik udostępnił już ten post!");

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

        [HttpDelete("[action]/{postId}/{userId}")]
        public IActionResult DeleteShare(int postId, string userId)
        {
            var response = sharingService.DeleteShare(postId, userId);
            if (response.ResponseCode == 404)
                return NotFound(response.ResponseBody);

            else return Ok(response);
        }
    }
}
