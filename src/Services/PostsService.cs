﻿using Microsoft.AspNetCore.Mvc;
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
            for (int i = 0; i < 20; i++)
            {
                posts.Add( new Post() { Id = i , Content = $"test{i}", CommunityId = (i%3)+i/3});
            }
        }
        public List<Post> GetPostsFromRange(int start, int length)
        {
            //Po dodaniu połączenia z bazą danych prawdopodobnie dochodziłoby tu do zapytania o posty o indeksach (start, start+length),
            //ale jeśli jakieś posty zostałyby usunięte doprowadziłoby to do wyświetlenie mniejszej liczby postów niż length, nie sądzę,
            //żeby było to docelowe działanie
            //context.Posts.Where(x => x.Id >= start && x.Id < start + length); <--- to o czym myślę
            if(start > posts.Count)
                throw new NoContentException("No Posts were possible to be Retrived");
            if(start + length > posts.Count)
                //prosze niech nikt mnie nie bije, czuję, że to nie potrzebuje exception ale zanim się o to zapytam to zrobiłem to tak
                throw new PartialContentException<List<Post>>(posts.GetRange(start, posts.Count-start));
            return posts.GetRange(start, length);
        }
        public List<Post> GetPostsFromRangeFromCommunity(int start, int length, int commnityId)
        {
            if (start > posts.Count)
                throw new NoContentException("No Posts were possible to be Retrived");
            if (start + length > posts.Where(x => x.CommunityId == commnityId).ToList().Count)
                //prosze niech nikt mnie nie bije, czuję, że to nie potrzebuje exception ale zanim się o to zapytam to zrobiłem to tak
                throw new PartialContentException<List<Post>>(posts.Where(x => x.CommunityId == commnityId).ToList().Skip(start).ToList());
            return posts.Where(x => x.CommunityId == commnityId).ToList().GetRange(start, length);
        }
    }
    class NoContentException : Exception
    {
        public NoContentException()
        {
        }

        public NoContentException(string? message) : base(message)
        {
        }

        public NoContentException(string? message, Exception? innerException) : base(message, innerException)
        {
        }
    }
    //Jak bardzo okropne to jest? mam bardzo silne przeczucie że powiniennem to zmienić ale chcę zobaczyć reakcje
    class PartialContentException<T> : Exception
    {
        public T partialContent;
        public PartialContentException(T partialContent)
        {
            this.partialContent = partialContent;
        }

        public PartialContentException(string? message, T partialContent) : base(message)
        {
            this.partialContent = partialContent;
        }

        public PartialContentException(string? message, Exception? innerException, T partialContent) : base(message, innerException)
        {
            this.partialContent = partialContent;
        }
    }
}
