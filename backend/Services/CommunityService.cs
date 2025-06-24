using Projekt_Zespolowy.Authentication;

namespace Projekt_Zespolowy.Services
{
    public class CommunityService
    {
        AppDbContext context;
        public CommunityService(AppDbContext context)
        {
            this.context = context;
        }
        public bool GetIfCommunityExists(int communityId)
        {
            return context.Communities.FirstOrDefault(x =>  x.Id == communityId) != null;
        }
    }
}
