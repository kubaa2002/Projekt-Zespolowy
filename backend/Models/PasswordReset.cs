using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Projekt_Zespolowy.Authentication;
using Projekt_Zespolowy.Models;

namespace Projekt_Zespolowy.Models
{
    public class PasswordReset
    {
        public int Id { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        public string Token { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; }

        public DateTime ExpiresAt { get; set; }

        public bool Used { get; set; } = false;
    }
}