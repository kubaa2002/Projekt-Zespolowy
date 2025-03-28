using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Projekt_Zespolowy.Authentication;

public class RevokedTokenFilter : IAsyncAuthorizationFilter
{
    private readonly AppDbContext _dbContext;

    public RevokedTokenFilter(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var token = context.HttpContext.Request.Headers["Authorization"].ToString().Replace("Bearer ", "").Trim();
        if (!string.IsNullOrEmpty(token) && await _dbContext.RevokedTokens.AnyAsync(rt => rt.Token == token))
        {
            context.Result = new UnauthorizedResult();
        }
    }
}
