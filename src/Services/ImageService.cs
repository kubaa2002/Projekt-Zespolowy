using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;
using ImageMagick;
using Microsoft.EntityFrameworkCore;

namespace Projekt_Zespolowy.Services
{
    public class ImageService
    {
        private readonly AppDbContext context;

        public ImageService(AppDbContext context)
        {
            this.context = context;
        }

        public ServiceResponse<Image?> GetImage(int id)
        {
            var response = context.Images.SingleOrDefault(i => i.Id == id);
            if (response == default)
                return new ServiceResponse<Image?>(StatusCodes.Status404NotFound, null);
            else
                return new ServiceResponse<Image?>(StatusCodes.Status200OK, response);
        }

        public ServiceResponse<Image?> GetUserImage(string userId)
        {
            var user = context.Users.SingleOrDefault(u => u.Id == userId);
            if (user == default || !user.ProfileImageId.HasValue)
                return new ServiceResponse<Image?>(StatusCodes.Status404NotFound,null);

            return GetImage(user.ProfileImageId.Value);
        }

        public ServiceResponse<Image?> GetCommunityImage(int id)
        {
            var community = context.Communities.SingleOrDefault(c => c.Id == id);
            if (community == default || !community.CommunityImageId.HasValue)
                return new ServiceResponse<Image?>(StatusCodes.Status404NotFound, null);

            return GetImage(community.CommunityImageId.Value);
        }

        public ServiceResponse<Image?> GetPostImage(int id)
        {
            var post = context.Posts.SingleOrDefault(p => p.Id == id);
            if (post == default || !post.ImageId.HasValue)
                return new ServiceResponse<Image?>(StatusCodes.Status404NotFound, null);

            return GetImage(post.ImageId.Value);
        }

        public ServiceResponse<string?> AddImage(IFormFile file)
        {
            try
            {
                byte[] imageData;
                using (var inputStream = file.OpenReadStream())
                    using (var image = new MagickImage(inputStream))
                    {
                        // Upewnienie się że obraz jest odpowiedniej wielkości
                        uint size = 512;
                        if (image.BaseHeight != size || image.BaseWidth != size)
                        {
                            image.Resize(new MagickGeometry($"{size}x{size}^"));
                            image.Crop(size, size, Gravity.Center);
                        }

                        // Usuwanie meta danych
                        image.Strip();
                        image.Format = MagickFormat.Jpeg;

                        using (var ms = new MemoryStream())
                        {
                            image.Write(ms);
                            imageData = ms.ToArray();
                        }
                    }
                Image newImage = new() { ContentType = "image/jpeg", ImageData = imageData };
                context.Images.Add(newImage);
                context.SaveChanges();

                return new ServiceResponse<string?>(StatusCodes.Status200OK, $"{newImage.Id}");
            }
            catch (Exception ex)
            {
                return new ServiceResponse<string?>(StatusCodes.Status400BadRequest, ex.Message);
            }
        }

        public ServiceResponse<string?> AddUserImage(IFormFile file, string userName)
        {
            var user = context.Users.SingleOrDefault(u => u.UserName == userName);
            if (user == default)
                return new ServiceResponse<string?>(StatusCodes.Status404NotFound, "user doesn't exist");

            var response = AddImage(file);
            if (response.ResponseCode == StatusCodes.Status400BadRequest)
                return response;

            var oldImage = context.Images.SingleOrDefault(i => i.Id == user.ProfileImageId);
            user.ProfileImageId = int.Parse(response.ResponseBody!);

            if (oldImage != null)
                context.Images.Remove(oldImage);
            context.SaveChanges();

            return new ServiceResponse<string?>(StatusCodes.Status200OK, "Image uploaded");
        }

        public ServiceResponse<string?> AddCommunityImage(IFormFile file, int communityId, string userName)
        {
            var community = context.Communities.SingleOrDefault(c => c.Id == communityId);
            if (community == default)
                return new ServiceResponse<string?>(StatusCodes.Status404NotFound, "community doesn't exist");
            var user = context.Users.SingleOrDefault(u => u.UserName == userName);
            if (user == default) 
                return new ServiceResponse<string?>(StatusCodes.Status401Unauthorized, "user not logged in");
            var member = context.CommunityMembers.SingleOrDefault(m => m.User == user && m.CommunityId == communityId);
            if (member == default)
                return new ServiceResponse<string?>(StatusCodes.Status400BadRequest, "user is not a part of this community");
            if (member.Role != "owner")
                return new ServiceResponse<string?>(StatusCodes.Status401Unauthorized, "user is not the owner of this community");

            var response = AddImage(file);
            if (response.ResponseCode == StatusCodes.Status400BadRequest)
                return response;

            var oldImage = context.Images.SingleOrDefault(i => i.Id == community.CommunityImageId);
            community.CommunityImageId = int.Parse(response.ResponseBody!);
            if (oldImage != null)
                context.Images.Remove(oldImage);
            context.SaveChanges();

            return new ServiceResponse<string?>(StatusCodes.Status200OK, "Image uploaded");
        }

        public ServiceResponse<string?> AddPostImage(IFormFile file, int postId, string userName)
        {
            var post = context.Posts.Include(p => p.Author).SingleOrDefault(p => p.Id == postId);
            if (post == default)
                return new ServiceResponse<string?>(StatusCodes.Status404NotFound, "post doesn't exist");
            if (post.Author!.UserName != userName)
                return new ServiceResponse<string?>(StatusCodes.Status401Unauthorized, "user is not the author of this post");

            var response = AddImage(file);
            if (response.ResponseCode == StatusCodes.Status400BadRequest)
                return response;

            var oldImage = context.Images.SingleOrDefault(i => i.Id == post.ImageId);
            post.ImageId = int.Parse(response.ResponseBody!);

            if (oldImage != null)
                context.Images.Remove(oldImage);
            context.SaveChanges();

            return new ServiceResponse<string?>(StatusCodes.Status200OK, "Image uploaded");
        }
    }
}
