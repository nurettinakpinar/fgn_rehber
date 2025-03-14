using System.ComponentModel.DataAnnotations;

namespace FGN_WEB_REHBER.Server.Models.DTO
{
    public class RegisterDTO
    {
        [Required]
        public string Name { get; set; } = null!;
        [Required]
        public string UserName { get; set; } = null!;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

    }
}
