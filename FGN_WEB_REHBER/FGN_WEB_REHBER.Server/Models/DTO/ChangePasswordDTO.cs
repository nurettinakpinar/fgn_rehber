using System.ComponentModel.DataAnnotations;

namespace FGN_WEB_REHBER.Server.Models.DTO
{
    public class ChangePasswordDTO
    {
        [Required]
        public string CurrentPassword { get; set; } = "";

        [Required]
        public string NewPassword { get; set; } = "";
    }
}
