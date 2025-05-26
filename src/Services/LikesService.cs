using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;
using Projekt_Zespolowy.Posts;

namespace Projekt_Zespolowy.Services
{
    public class LikesService
    {
        AppDbContext context;

        public LikesService(AppDbContext context)
        {
            this.context = context;
        }
        public ServiceResponse<Like> Add(Like like)
        {
            if (like.CreatedDateTime == default)
                like.CreatedDateTime = DateTimeOffset.UtcNow;
            var result = context.Likes.SingleOrDefault(x => x.PostId == like.PostId && x.AppUserId == like.AppUserId);
            if (result != default)
            {
                return new ServiceResponse<Like>(StatusCodes.Status409Conflict, result);
            }
            else
            {
                context.Likes.Add(like);
                context.SaveChanges();
                return new ServiceResponse<Like>(StatusCodes.Status200OK, like);
            }
        }
    }
}
