using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;
using Projekt_Zespolowy.Posts;
using Projekt_Zespolowy.Sharing;

namespace Projekt_Zespolowy.Services
{
    public class SharingService : Controller
    {
        AppDbContext context;
        public SharingService(AppDbContext context)
        {
            this.context = context;
        }

        public HttpStatusCode SharePost(int postId, string userId)
        {
            if (context.Posts.FirstOrDefault(p => p.Id == postId) != default
                && context.Users.FirstOrDefault(u => u.Id == userId) != default)
            {
                context.Shares.Add(
                    new Share
                    {
                        AppUserId = userId,
                        PostId = postId,
                    });
                context.SaveChanges();
                return HttpStatusCode.Created;
            }
            else return HttpStatusCode.NotFound;
        }
        /// <summary>
        /// You get list od id's of Posts shared by User with given UserId.
        /// </summary>
        /// <param name="UserId"></param>
        /// <returns></returns>
        public ICollection<int> GetSharedPostsIds(string userId)
        {
            
            if (context.Users.FirstOrDefault(u => u.Id == userId) != default)
            {
                return context.Shares
                    .Where(sp => sp.AppUserId == userId)
                    .Select(sp => sp.PostId)
                    .ToList();
            }
            else {return null; }
        }
        /// <summary>
        /// You get list of PostDTO's shared by User with given UserId.
        /// </summary>
        /// <param name="UserId"></param>
        /// <returns></returns>
        public ICollection<PostDTO> GetSharedPosts(string userId)
        {
            if (context.Users.FirstOrDefault(u => u.Id == userId) != default)
            {
                return (ICollection<PostDTO>)context.Shares
                .Where(sp => sp.AppUserId == userId)
                .Select(sp => sp.Post)
                .ToList();
            }
            else return null;
        }

        public ServiceResponse<string> DeleteShare(int postId, string userId)
        {
            if(context.Shares.FirstOrDefault(s => s.AppUserId == userId && s.PostId==postId) == default)
                {
                    return new ServiceResponse<string>(404, "Użytkownik nie udostępnił danego postu!");
                }
            return new ServiceResponse<string>(200, "Usunięto udostępnienie posta");
        }
    }
}
