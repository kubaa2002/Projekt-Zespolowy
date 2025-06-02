using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Likes;
using Projekt_Zespolowy.Models;

namespace Projekt_Zespolowy.Services
{
    public class LikesService
    {
        AppDbContext context;

        public LikesService(AppDbContext context)
        {
            this.context = context;
        }
        public ServiceResponse<Like> Add(LikeDTO like)
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
                context.Likes.Add((Like)like);
                context.SaveChanges();
                return new ServiceResponse<Like>(StatusCodes.Status200OK, like);
            }
        }
        public ServiceResponse<List<Like>> GetOfPost(int postId)
        {
            List<Like> likes = context.Likes.Where(x => x.PostId == postId).ToList();
            if (likes.Count == 0)
            {
                return new ServiceResponse<List<Like>>(StatusCodes.Status204NoContent, null);
            }
            return new ServiceResponse<List<Like>>(StatusCodes.Status200OK, likes);
        }
        public ServiceResponse<List<Like>> GetOfPostByType(int postId, int type)
        {
            List<Like> likes = context.Likes.Where(x => x.PostId == postId).Where(x=>x.ReactionId == type).ToList();
            if (likes.Count == 0)
            {
                return new ServiceResponse<List<Like>>(StatusCodes.Status204NoContent, null);
            }
            return new ServiceResponse<List<Like>>(StatusCodes.Status200OK, likes);
        }
        public ServiceResponse<int> GetOfPostCountByType(int postId, int type)
        {
            List<Like> likes = context.Likes.Where(x => x.PostId == postId).Where(x=>x.ReactionId == type).ToList();
            return new ServiceResponse<int>(StatusCodes.Status200OK, likes.Count);
        }
        public ServiceResponse<int> GetOfPostCount(int postId)
        {
            List<Like> likes = context.Likes.Where(x => x.PostId == postId).ToList();
            return new ServiceResponse<int>(StatusCodes.Status200OK, likes.Count);
        }
    }
}
