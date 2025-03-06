using Microsoft.AspNetCore.Identity;

namespace FGN_WEB_REHBER.Server.Entities
{
    public class AppUser : IdentityUser
    {
        public string? Name { get; set; }
    }
}
