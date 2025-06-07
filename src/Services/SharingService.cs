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

        public ServiceResponse<ShareDTO> SharePost(int postId, string userId)
        {
            if (context.Posts.FirstOrDefault(p => p.Id == postId) == null)
            {
                Console.WriteLine("Dany post nie istnieje");
                return new ServiceResponse<ShareDTO>(StatusCodes.Status404NotFound, null);

            }
            if (context.Users.FirstOrDefault(u => u.Id == userId) == null)
            {
                Console.WriteLine("Dany user nie istnieje");
                return new ServiceResponse<ShareDTO>(StatusCodes.Status404NotFound, null);
            }
            if (context.Shares.Any(s => s.PostId == postId && s.AppUserId == userId))
                return new ServiceResponse<ShareDTO>(StatusCodes.Status409Conflict, null);
            
            Share share = new()
            {
                AppUserId = userId,
                PostId = postId,
            };
            context.Shares.Add(share);
            context.SaveChanges();
            return new ServiceResponse<ShareDTO>(StatusCodes.Status201Created, share);
        }
        /// <summary>
        /// You get list od id's of Posts shared by User with given UserId.
        /// </summary>
        /// <param name="UserId"></param>
        /// <returns></returns>
        public ServiceResponse<ICollection<int>> GetSharedPostsIds(string userId)
        {

            if (context.Users.FirstOrDefault(u => u.Id == userId) == default)
                return new ServiceResponse<ICollection<int>>(404, null);

            var postIds = context.Shares
                .Where(sp => sp.AppUserId == userId)
                .Select(sp => sp.PostId)
                .ToList();

            if (postIds.Count() == 0)
                return new ServiceResponse<ICollection<int>>(204, null);

            return new ServiceResponse<ICollection<int>>(200, postIds);
        }
        ///// <summary>
        ///// You get list of PostDTO's shared by User with given UserId.
        ///// </summary>
        ///// <param name = "UserId" ></ param >
        ///// < returns ></ returns >
        //public ICollection<PostDTO> GetSharedPosts(string userId)
        //{
        //    if (context.Users.FirstOrDefault(u => u.Id == userId) != default)
        //    {
        //        //return (ICollection<PostDTO>)context.Posts
        //        //.Where(sp => sp.AppUserId == userId)
        //        //.Include(sp => sp.PostId)
        //        //    .ThenInclude(p => p.AppUserId)
        //        //.Select(sp => sp.Post)
        //        //.ToList();

        //        var postIds = context.Shares
        //            .Where(sp => sp.AppUserId == userId)
        //            .Select(sp => sp.PostId)
        //            .ToList();

        //        var posts = context.Posts
        //        .Where(p => postIds.Contains(p.Id))
        //        .Include(s => s.Title)
        //        .Include(s => s.AppUserId)
        //        .Include(s => s.Content)
        //        .Include(s => s.CommunityId)
        //        .Include(s => s.CreatedDateTime)
        //        .Include(s => s.ParentId)
        //        //.Include(s => s.ReactionCount)
        //        .Include(s => s.Likes)

        //        // załaduj powiązany post
        //        //    .ThenInclude(p => p.Content)    // załaduj np. autora posta (jeśli istnieje taka relacja)
        //        //.Select(s => (PostDTO)s.Post)
        //        .Select(p => (PostDTO)p)
        //        .ToList();

        //        return posts;
        //    }
        //    else return null;
        //}

        public ServiceResponse<string> DeleteShare(int postId, string userId)
        {
            var share = context.Shares.FirstOrDefault(s => s.AppUserId == userId && s.PostId == postId);
            if (share == default)
            {
                return new ServiceResponse<string>(404, "Użytkownik nie udostępnił danego postu!");
            }
            context.Shares.Remove(share);
            context.SaveChanges();
            return new ServiceResponse<string>(200, "Usunięto udostępnienie posta");
        }
    }
}
