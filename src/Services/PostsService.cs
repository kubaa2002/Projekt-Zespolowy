using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Posts;

namespace Projekt_Zespolowy.Services
{
    //TODO: Add connection to database instead of hard coded objects
    //WhyNotDoneAlready: no posts database, no knowledge what post like :(
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
                posts.Add( new Post() { Id = i , Content = $"test{i}", CommunityId = i%12 >= 8 ? null : i/12, authorId = i%16, parentId = i%4 == 0 ? null : i/4, CreatedDateTime = DateTime.UtcNow});
            }
        }
        public ServiceResponse<List<Post>> GetPostsFromRange(int start, int length)
        {
            //Po dodaniu połączenia z bazą danych prawdopodobnie dochodziłoby tu do zapytania o posty o indeksach (start, start+length),
            //ale jeśli jakieś posty zostałyby usunięte doprowadziłoby to do wyświetlenie mniejszej liczby postów niż length, nie sądzę,
            //żeby było to docelowe działanie
            //context.Posts.Where(x => x.Id >= start && x.Id < start + length); <--- to o czym myślę
            List<Post> foundPosts = posts.Where(x => x.parentId == null).ToList();
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
            List<Post> foundPosts = posts.Where(x => x.parentId == null).Where(x => x.CommunityId == commnityId).ToList();
            // When no posts
            if (start > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status204NoContent, null);
            // When only partial content
            if (start + length > foundPosts.Count)
                return new ServiceResponse<List<Post>>(StatusCodes.Status206PartialContent, foundPosts.Skip(start).ToList());
            // When ok
            return new ServiceResponse<List<Post>>(StatusCodes.Status200OK, foundPosts.GetRange(start, length));
        }
        public ServiceResponse<List<Post>> GetPostsFromRangeFromUser(int start, int length, int authorId)
        {
            List<Post> foundPosts = posts.Where(x => x.parentId == null).Where(x => x.CommunityId == null).Where(x => x.authorId == authorId).ToList();
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
            List<Post> foundPosts = posts.Where(x => x.parentId == parentId).ToList();
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
            var result = context.Posts.SingleOrDefault(x => x.Id == id);
            if (result == null) 
            {
                return new ServiceResponse<Post>(StatusCodes.Status404NotFound, null);
            }
            else
                return new ServiceResponse<Post>(StatusCodes.Status200OK, result);
        }
        public ServiceResponse<Post> Add(PostDTO newPost)
        {
            //Post post = new Post
            //{
            //    Id = newPost.Id,
            //    authorId = newPost.authorId,
            //    CommunityId = newPost.CommunityId,
            //    Content = newPost.Content,
            //    CreatedDateTime = newPost.CreatedDateTime,
            //    //UpdatedDateTime = DateTime.Now,
            //    parentId = newPost.parentId,
            //};

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
            else if (GetById(newPost.Id).ResponseCode != StatusCodes.Status404NotFound)
            {
                return new ServiceResponse<Post>(StatusCodes.Status409Conflict, null);
            }
            else
            {
                posts.Add(post); //do usunięcia po przejściu na bazę danych
                context.Posts.Add(post);
                context.SaveChanges();
                return new ServiceResponse<Post>(StatusCodes.Status201Created, post);
            }
            
        }
        public ServiceResponse<Post> Update(PostDTO newPost)
        {
            Post post = newPost;
            if (GetById(newPost.Id).ResponseCode == StatusCodes.Status404NotFound)
            {
                return new ServiceResponse<Post>(StatusCodes.Status404NotFound, null);
            }
            else if (post.Content.Length > 2000)
            {
                return new ServiceResponse<Post>(StatusCodes.Status413PayloadTooLarge, null);
            }
            else if (post.Content.Length == 0)
            {
                return new ServiceResponse<Post>(StatusCodes.Status400BadRequest, null);
            }
            else
            {
                int index = posts.FindIndex(c => c.Id == newPost.Id); //do usunięcia po przejściu na bazę danych
                if (index != -1) posts[index] = post;

                context.Posts.Update(post);
                return new ServiceResponse<Post>(StatusCodes.Status200OK, post);
            }
        }
        public void Remove(PostDTO newPost)
        {
            Post post = newPost;
            posts.Remove(post);
            context.Posts.Remove(post);

            //or we should change IsDeleted to True
        }
    }
}
