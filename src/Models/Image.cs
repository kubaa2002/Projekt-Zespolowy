using System.ComponentModel.DataAnnotations;

namespace Projekt_Zespolowy.Models
{
    public class Image
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public required byte[] ImageData { get; set; }
        [Required]
        public required string ContentType { get; set; }
        public string? FileName { get; set; }
    }
}
