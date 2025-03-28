namespace Projekt_Zespolowy.Authentication;

public class ErrorResponse
{
    public int Status { get; set; }
    public Dictionary<string, List<string>> Errors { get; set; } = new();
}
