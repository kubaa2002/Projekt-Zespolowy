using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;
using Projekt_Zespolowy.Posts;

namespace Projekt_Zespolowy.Services
{
    public class PostsService : Controller
    {
        AppDbContext context;
        List<Post> posts;
        public PostsService(AppDbContext context)
        {
            this.context = context;
            posts = new List<Post>();
            for (int i = 0; i < 150; i++)
            {
                posts.Add( new Post() { Id = i , Content = $"test{i}", CommunityId = i%12 >= 8 ? null : i/12, AppUserId = (i%16).ToString(), ParentId = i%4 == 0 ? null : i/4, CreatedDateTime = DateTime.UtcNow});
            }
        }
        public ServiceResponse<List<Post>> GetPostsFromRange(int start, int length)
        {
            //Po dodaniu połączenia z bazą danych prawdopodobnie dochodziłoby tu do zapytania o posty o indeksach (start, start+length),
            //ale jeśli jakieś posty zostałyby usunięte doprowadziłoby to do wyświetlenie mniejszej liczby postów niż length, nie sądzę,
            //żeby było to docelowe działanie
            //context.Posts.Where(x => x.Id >= start && x.Id < start + length); <--- to o czym myślę
            List<Post> foundPosts = posts.Where(x => x.ParentId == null).ToList();
            // When no posts
            if (start > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null);
            // When only partial content
            if (start + length > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status206PartialContent,foundPosts.Skip(start).ToList());
            // When ok
            return new ServiceResponse<List<Post>>(StatusCodes.Status200OK,foundPosts.GetRange(start, length));
        }
        public ServiceResponse<List<Post>> GetPostsFromRangeFromCommunity(int start, int length, int commnityId)
        {
            List<Post> foundPosts = posts.Where(x => x.ParentId == null).Where(x => x.CommunityId == commnityId).ToList();
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
            List<Post> foundPosts = posts.Where(x => x.ParentId == null).Where(x => x.CommunityId == null).Where(x => x.AppUserId == authorId).ToList();
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
            List<Post> foundPosts = posts.Where(x => x.ParentId == parentId).ToList();
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
            if (result.Count() == 0)
            {
                return new ServiceResponse<IEnumerable<Post>>(StatusCodes.Status204NoContent, null);
            }
            else
                return new ServiceResponse<IEnumerable<Post>>(StatusCodes.Status200OK, result);
        }
        public ServiceResponse<Post> GetById(int id)
        {
            var result = context.Posts.SingleOrDefault(x => x.Id == id);
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
                //posts.Add(post); //do usunięcia po przejściu na bazę danych
                context.Posts.Add(post);
                //context.SaveChanges();
                return new ServiceResponse<Post>(StatusCodes.Status201Created, post);
            }
        }
        public ServiceResponse<Post> AddInCommunity(int community_id, PostDTO newPost)
        {
            //var result = context.Communities.SingleOrDefault(x => x.Id == community_id);
            //if (result == default)
            //{
            //    Console.WriteLine("Community does not exist!");
            //    return new ServiceResponse<Post>(StatusCodes.Status404NotFound, null);
            //}
            //else
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
            else
            {
                int index = posts.FindIndex(c => c.Id == newPost.Id); //do usunięcia po przejściu na bazę danych
                if (index != -1) posts[index] = post;

                context.Posts.Update(post);
                //context.SaveChanges();
                return new ServiceResponse<Post>(StatusCodes.Status200OK, post);
            }
        }
        /// <summary>
        /// Changes the value of IsDeleted property to True.
        /// </summary>
        /// <param name="newPost"> A DTO record that shall be deleted.</param>
        public ServiceResponse<Post> Delete(int id, PostDTO newPost)
        {
            //var post = context.Posts.SingleOrDefault(x => x.Id == id);
            //if (post == default)
            //{
            //    return new ServiceResponse<Post>(StatusCodes.Status404NotFound, null);
            //}
            //else
            //{ 
            //    post.IsDeleted = true;
            //    return Update(post); //można później zmienić aby nie dublować wywoływania metod
            //}
            Post post = newPost;
            post.IsDeleted = true;
            return Update(post);
        }

        public ServiceResponse<Post> UndoDelete(int id, PostDTO newPost)
        {
            //var post = context.Posts.SingleOrDefault(x => x.Id == id);
            //if (post == default)
            //{
            //    return new ServiceResponse<Post>(StatusCodes.Status404NotFound, null);
            //}
            //else
            //{ 
            //    post.IsDeleted = false;
            //    return Update(post); //można później zmienić aby nie dublować wywoływania metod
            //}
            Post post = newPost;
            post.IsDeleted = false;
            return Update(post);
        }
    }
}
