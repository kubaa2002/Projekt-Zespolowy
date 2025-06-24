using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace Projekt_Zespolowy.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _senderName;
        private readonly string _senderEmail;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
            _smtpServer = _configuration["SmtpSettings:Server"];
            _smtpPort = int.Parse(_configuration["SmtpSettings:Port"]);
            _smtpUsername = _configuration["SmtpSettings:Username"];
            _smtpPassword = _configuration["SmtpSettings:Password"];
            _senderName = _configuration["SmtpSettings:SenderName"];
            _senderEmail = _configuration["SmtpSettings:SenderEmail"];
        }

        public async Task<bool> SendEmailAsync(string recipientEmail, string subject, string body)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(_senderName, _senderEmail));
                message.To.Add(new MailboxAddress("", recipientEmail));
                message.Subject = subject;

                message.Body = new TextPart("plain")
                {
                    Text = body
                };

                using (var client = new SmtpClient())
                {
                    // For demo purposes, allow insecure options if needed, but avoid in production
                    // client.ServerCertificateValidationCallback = (s, c, h, e) => true;

                    await client.ConnectAsync(_smtpServer, _smtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                    await client.AuthenticateAsync(_smtpUsername, _smtpPassword);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }
                return true;
            }
            catch (Exception ex)
            {
                // Log the exception details for debugging
                Console.WriteLine($"Error sending email: {ex.Message}");
                // In production, use a proper logger (e.g., ILogger)
                return false;
            }
        }
    }
}