using FGN_WEB_REHBER.Server.Models.Entities;
using Microsoft.AspNetCore.Identity;

namespace FGN_WEB_REHBER.Server.Data
{
    public static class SeedDatabase
    {
        public static async void Initialize(IApplicationBuilder app)
        {
            var userManager = app.ApplicationServices
                                .CreateScope()
                                .ServiceProvider
                                .GetRequiredService<UserManager<AppUser>>();

            var roleManager = app.ApplicationServices
                                .CreateScope()
                                .ServiceProvider
                                .GetRequiredService<RoleManager<AppRole>>();

            if (!roleManager.Roles.Any())
            {
                var admin = new AppRole { Name = "Admin" };

                await roleManager.CreateAsync(admin);
            }

            if (!userManager.Users.Any())
            {
                var admin = new AppUser { Name = "Nurettin AKPINAR", UserName = "nurettinakpinar", Email = "admin@hotmail.com" };

                await userManager.CreateAsync(admin, "Akpinar99.");
            }
        }
    }
}
