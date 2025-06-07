namespace Projekt_Zespolowy.Services
{
    public interface ICurrentUserService
    {
        string? UserId { get; }
        string? Username { get; }
    }
}