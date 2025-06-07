using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;
using Projekt_Zespolowy.Posts;
using Microsoft.EntityFrameworkCore;

namespace Projekt_Zespolowy.Services
{
    //TODO: Add connection to database instead of hard coded objects
    //WhyNotDoneAlready: no posts database, no knowledge what post like :(
    public class PostsService
    {
        AppDbContext context;
        List<Post> posts;
        private readonly ICurrentUserService _currentUserService;
        public PostsService(AppDbContext context, ICurrentUserService currentUserService)
        {
            this.context = context;
            posts = new List<Post>();
            for (int i = 0; i < 150; i++)
            {
                posts.Add( new Post() { Id = i , Content = $"test{i}", CommunityId = i%12 >= 8 ? null : i/12, AppUserId = (i%16).ToString(), ParentId = i%4 == 0 ? null : i/4, CreatedDateTime = DateTime.UtcNow});
            }
            _currentUserService = currentUserService;
        }
        public ServiceResponse<List<Post>> GetPostsSortedByNewest(int start, int length)
        {
            var posts = context.Posts
                .Where(p => p.ParentId == null)
                .Include(p => p.Likes)
                .OrderByDescending(p => p.CreatedDateTime)
                .Skip(start).Take(length)
                .ToList();

            return posts.Count == 0
                ? new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null)
                : new ServiceResponse<List<Post>>(StatusCodes.Status200OK, posts);
        }

        public ServiceResponse<List<Post>> GetPostsSortedByPopularity(int start, int length)
        {
            var posts = context.Posts
                .Where(p => p.ParentId == null)
                .Include(p => p.Likes)
                .OrderByDescending(p => p.Likes.Count)
                .Skip(start).Take(length)
                .ToList();

            return posts.Count == 0
                ? new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null)
                : new ServiceResponse<List<Post>>(StatusCodes.Status200OK, posts);
        }

        public ServiceResponse<List<Post>> GetCommunityPostsSortedByNewest(int communityId, int start, int length)
        {
            var posts = context.Posts
                .Where(p => p.ParentId == null && p.CommunityId == communityId)
                .Include(p => p.Likes)
                .OrderByDescending(p => p.CreatedDateTime)
                .Skip(start).Take(length)
                .ToList();

            return posts.Count == 0
                ? new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null)
                : new ServiceResponse<List<Post>>(StatusCodes.Status200OK, posts);
        }

        public ServiceResponse<List<Post>> GetCommunityPostsSortedByPopularity(int communityId, int start, int length)
        {
            var posts = context.Posts
                .Where(p => p.ParentId == null && p.CommunityId == communityId)
                .Include(p => p.Likes)
                .OrderByDescending(p => p.Likes.Count)
                .Skip(start).Take(length)
                .ToList();

            return posts.Count == 0
                ? new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null)
                : new ServiceResponse<List<Post>>(StatusCodes.Status200OK, posts);
        }

        public ServiceResponse<List<Post>> GetObservedPostsSortedByNewest(int start, int length)
        {
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
            {
                return new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null);
            }
            var userCommunityIds = context.CommunityMembers
                .Where(cm => cm.AppUserId == userId)
                .Select(cm => cm.CommunityId);

            var followedUserIds = context.Followers
                .Where(f => f.FollowerId == userId)
                .Select(f => f.FollowingId);

            var query = context.Posts
                .Where(p => p.ParentId == null && p.AppUserId != userId)
                .Join(followedUserIds,
                    post => post.AppUserId,
                    followedId => followedId,
                    (post, followedId) => post) 

                .Join(userCommunityIds,
                    post => post.CommunityId, 
                    communityId => communityId,
                    (post, communityId) => post); 

            var posts = query
                .Include(p => p.Likes)
                .OrderByDescending(p => p.CreatedDateTime)
                .Skip(start)
                .Take(length)
                .ToList();


            return posts.Any()
                ? new ServiceResponse<List<Post>>(StatusCodes.Status200OK, posts)
                : new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null);

        public PostsService(AppDbContext context)
        {
            this.context = context;

        }
        public ServiceResponse<List<Post>> GetPostsFromRange(int start, int length)
        {
            //Po dodaniu połączenia z bazą danych prawdopodobnie dochodziłoby tu do zapytania o posty o indeksach (start, start+length),
            //ale jeśli jakieś posty zostałyby usunięte doprowadziłoby to do wyświetlenie mniejszej liczby postów niż length, nie sądzę,
            //żeby było to docelowe działanie
            //context.Posts.Where(x => x.Id >= start && x.Id < start + length); <--- to o czym myślę
          
            List<Post> foundPosts = context.Posts.Where(x => x.ParentId == null).Include(x=>x.Likes).ToList();
            // When no posts
            if (start > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null);
            // When only partial content
            if (start + length > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status206PartialContent, foundPosts.Skip(start).ToList());
            // When ok
            return new ServiceResponse<List<Post>>(StatusCodes.Status200OK, foundPosts.GetRange(start, length));
        }
        public ServiceResponse<List<Post>> GetPostsFromRangeFromCommunity(int start, int length, int commnityId) 
        { 
            List<Post> foundPosts = context.Posts.Where(x => x.ParentId == null).Where(x => x.CommunityId == commnityId).Include(x => x.Likes).ToList();
            // When no posts
            if (start > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null);
            // When only partial content
            if (start + length > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status206PartialContent, foundPosts.Skip(start).ToList());
            // When ok
            return new ServiceResponse<List<Post>>(StatusCodes.Status200OK, foundPosts.GetRange(start, length));
        }
        public ServiceResponse<List<Post>> GetPostsFromRangeFromUser(int start, int length, string authorId)
        {
            List<Post> foundPosts = context.Posts.Where(x => x.ParentId == null).Where(x => x.CommunityId == null).Where(x => x.AppUserId == authorId).Include(x => x.Likes).ToList();
            // When no posts
            if (start > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null);
            // When only partial content
            if (start + length > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status206PartialContent, foundPosts.Skip(start).ToList());
            // When ok
            return new ServiceResponse<List<Post>>(StatusCodes.Status200OK, foundPosts.GetRange(start, length));
        }
        public ServiceResponse<List<Post>> GetCommentsFromRangeFromPost(int start, int length, int parentId)
        {
            List<Post> foundPosts = context.Posts.Where(x => x.ParentId == parentId).Include(x => x.Likes).ToList();
            // When no posts
            if (start > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null);
            // When only partial content
            if (start + length > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status206PartialContent, foundPosts.Skip(start).ToList());
            // When ok
            return new ServiceResponse<List<Post>>(StatusCodes.Status200OK, foundPosts.GetRange(start, length));
        }

    public ServiceResponse<IEnumerable<Post>> GetAll()
        {
            var result = context.Posts.ToList();
            if (result.Count == 0)
            {
                return new ServiceResponse<IEnumerable<Post>>(StatusCodes.Status204NoContent, null);
            }
            else
            {
                return new ServiceResponse<IEnumerable<Post>>(StatusCodes.Status200OK, result);
            }
        }
        public ServiceResponse<Post> GetById(int id)
        {
            var result = context.Posts.Include(x => x.Likes).SingleOrDefault(x => x.Id == id);
            if (result == default) 
            {
                return new ServiceResponse<Post>(StatusCodes.Status404NotFound, null);
            }
            else
                return new ServiceResponse<Post>(StatusCodes.Status200OK, result);
        }
        public ServiceResponse<Post> Add(PostDTO newPost)
        {
            Post post = newPost;
            if (post.CreatedDateTime == default)
                post.CreatedDateTime = DateTimeOffset.UtcNow;
            if (post.Content.Length > 2000)
            {
                return new ServiceResponse<Post>(StatusCodes.Status413PayloadTooLarge, null);
            }
            if (post.Content.Length == 0)
            {
                return new ServiceResponse<Post>(StatusCodes.Status400BadRequest, null);
            }
            //czy mogę tak wywołać metodę? czy to stworzy zbyt wiele zapytań i jest nieefektywne?
            //jako ciało można rozważyć zwracanie istniejącego rekordu, jest to w controllers
            var result = context.Posts.SingleOrDefault(x => x.Id == post.Id);
            if (result != default)
            {
                return new ServiceResponse<Post>(StatusCodes.Status409Conflict, result);
            }
            else
            {
                context.Posts.Add(post);
                context.SaveChanges();
                return new ServiceResponse<Post>(StatusCodes.Status201Created, post);
            }
        }
        public ServiceResponse<Post> AddInCommunity(int community_id, PostDTO newPost)
        {
            var result = context.Communities.SingleOrDefault(x => x.Id == community_id);
            if (result == default)
            {
                Console.WriteLine("Community does not exist!");
                return new ServiceResponse<Post>(StatusCodes.Status404NotFound, null);
            }
            else
                newPost.CommunityId = community_id;
                return Add(newPost);
        }
        public ServiceResponse<Post> AddComment(int parent_id, PostDTO newPost)
        {
            var result = context.Posts.SingleOrDefault(x => x.Id == parent_id);
            if (result == default || result.IsDeleted == true)
            {
                Console.WriteLine("Parent does not exist or is deleted!");
                return new ServiceResponse<Post>(StatusCodes.Status404NotFound, null);
            }
            else
                newPost.ParentId = parent_id;
                return Add(newPost);
        }

        public ServiceResponse<Post> Update(PostDTO newPost)
        {
            Post post = newPost;
            if (context.Posts.SingleOrDefault(x => x.Id == post.Id) != default)
            {
                return new ServiceResponse<Post>(StatusCodes.Status404NotFound, null);
            }
            if (post.Content.Length > 2000)
            {
                return new ServiceResponse<Post>(StatusCodes.Status413PayloadTooLarge, null);
            }
            if (post.Content.Length == 0)
            {
                return new ServiceResponse<Post>(StatusCodes.Status400BadRequest, null);
            }
            context.Posts.Update(post);
            context.SaveChanges();
            return new ServiceResponse<Post>(StatusCodes.Status200OK, post);
        }
        /// <summary>
        /// Changes the value of IsDeleted property to True.
        /// </summary>
        /// <param name="newPost"> A DTO record that shall be deleted.</param>
        public ServiceResponse<string?> Delete(int id, PostDTO newPost)
        {
            var post = context.Posts.SingleOrDefault(x => x.Id == id);
            if (post == default)
            {
                return new ServiceResponse<string?>(StatusCodes.Status404NotFound, null);
            }
            post.IsDeleted = true;
            var temp = Update(post);

            return new ServiceResponse<string?>(temp.ResponseCode, "deleted"); //można później zmienić aby nie dublować wywoływania metod
        }

        public ServiceResponse<string?> UndoDelete(int id, PostDTO newPost)
        {
            var post = context.Posts.SingleOrDefault(x => x.Id == id);
            if (post == default)
            {
                return new ServiceResponse<string?>(StatusCodes.Status404NotFound, null);
            }
            post.IsDeleted = false;
            var temp = Update(post);
            return new ServiceResponse<string?>(temp.ResponseCode, "undone deletetion"); //można później zmienić aby nie dublować wywoływania metod
        }
    }
}
