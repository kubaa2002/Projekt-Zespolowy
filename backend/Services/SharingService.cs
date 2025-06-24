using Microsoft.AspNetCore.Mvc;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;

namespace Projekt_Zespolowy.Services
{
    public class SharingService : Controller
    {
        AppDbContext context;
        public SharingService(AppDbContext context)
        {
            this.context = context;
        }

        public ServiceResponse<ShareDTO?> SharePost(int postId, string userId)
        {
            var post = context.Posts.FirstOrDefault(p => p.Id == postId);
            if (post == null)
            {
                Console.WriteLine("Dany post nie istnieje");
                return new ServiceResponse<ShareDTO?>(StatusCodes.Status404NotFound, null);
            }
            if (post.AppUserId == userId)
                return new ServiceResponse<ShareDTO?>(StatusCodes.Status400BadRequest, null);
            if (context.Users.FirstOrDefault(u => u.Id == userId) == null)
            {
                Console.WriteLine("Dany user nie istnieje");
                return new ServiceResponse<ShareDTO?>(StatusCodes.Status404NotFound, null);
            }
            if (context.Shares.Any(s => s.PostId == postId && s.AppUserId == userId))
                return new ServiceResponse<ShareDTO?>(StatusCodes.Status409Conflict, null);
            
            Share share = new()
            {
                AppUserId = userId,
                PostId = postId,
            };
            context.Shares.Add(share);
            context.SaveChanges();
            return new ServiceResponse<ShareDTO?>(StatusCodes.Status201Created, share);
        }

        public ServiceResponse<string> DeleteShare(int postId, string userId)
        {
            var share = context.Shares.FirstOrDefault(s => s.AppUserId == userId && s.PostId == postId);
            if (share == default)
            {
                return new ServiceResponse<string>(404, "Użytkownik nie udostępnił danego postu!");
            }
            context.Shares.Remove(share);
            context.SaveChanges();
            return new ServiceResponse<string>(204, "Usunięto udostępnienie posta");
        }
    }
}
