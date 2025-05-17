Projekt zespołowy

To use docker container you first need to make sure the %APPDATA%/ASP.NET/Https/ path exists and then create dev certificate in the right fodlder with this command
```
dotnet dev-certs https -ep %APPDATA%/ASP.NET/Https/cert.pfx -p Password
```