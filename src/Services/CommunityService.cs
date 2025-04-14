using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Posts;

namespace Projekt_Zespolowy.Services
{
    public class CommunityService
    {
        AppDbContext context;
        //PLACEHOLDER
        List<Community> communityList = new List<Community>();
        public CommunityService(AppDbContext context)
        {
            this.context = context;
            for (int i = 0; i < 10; i++)
            {
                communityList.Add(new Community() { Id = i });
            }
        }
        public bool GetIfCommunityExists(int communityId)
        {
            return communityList.FirstOrDefault(x =>  x.Id == communityId) != null;
        }
    }
}
