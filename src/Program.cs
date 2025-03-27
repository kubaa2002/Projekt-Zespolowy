var builder = WebApplication.CreateBuilder(args);
builder.Services.AddCors();

var app = builder.Build();

app.UseCors(policy => policy.WithOrigins("http://localhost:3000").AllowAnyMethod().AllowAnyHeader());

app.MapGet("/", () => new { message = "Hello from backend!" });

app.Run();