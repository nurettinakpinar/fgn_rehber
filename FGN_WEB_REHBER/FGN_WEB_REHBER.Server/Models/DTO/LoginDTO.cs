using System.ComponentModel.DataAnnotations;

namespace FGN_WEB_REHBER.Server.Models.DTO
{
    public class LoginDTO
    {
        [Required]
        public string UserName { get; set; } = null!;

        [Required]
        public string Password { get; set; } = null!;

    }
}
