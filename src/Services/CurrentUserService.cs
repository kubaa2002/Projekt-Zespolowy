using System.Security.Claims;
using Projekt_Zespolowy.Authentication;

namespace Projekt_Zespolowy.Services
{
    public class CurrentUserService : ICurrentUserService
    { 
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly AppDbContext _context; 

        private string? _cachedUserId;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor, AppDbContext context)
        {
            _httpContextAccessor = httpContextAccessor;
            _context = context;
        }

        public string? Username => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Name);

        public string? UserId
        {
            get
            {
                if (!string.IsNullOrEmpty(_cachedUserId))
                {
                    return _cachedUserId;
                }

                var username = this.Username;
                if (string.IsNullOrEmpty(username))
                {
                    return null;
                }

                var userIdFromDb = _context.Users
                                           .Where(u => u.UserName == username)
                                           .Select(u => u.Id)
                                           .FirstOrDefault();

                _cachedUserId = userIdFromDb;

                return _cachedUserId;
            }
        }
    }
}