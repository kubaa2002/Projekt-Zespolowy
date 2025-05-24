using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Projekt_Zespolowy.Authentication;
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
                context.SharedPosts.Add(
                    new SharedPost
                    {
                        UserId = userId,
                        PostId = postId,
                        ShareDateTime = DateTime.UtcNow
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
                return context.SharedPosts
                    .Where(sp => sp.UserId == userId)
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
                return (ICollection<PostDTO>)context.SharedPosts
                .Where(sp => sp.UserId == userId)
                .Select(sp => sp.PostNavigation)
                .ToList();
            }
            else return null;
        }
    }
}
