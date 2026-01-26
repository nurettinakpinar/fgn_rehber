using FGN_WEB_REHBER.Server.Data;
using FGN_WEB_REHBER.Server.Models.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public static class SeedDatabase
{
    public static async void InitializeAsync(IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var services = scope.ServiceProvider;

        var context = services.GetRequiredService<DataContext>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        var roleManager = services.GetRequiredService<RoleManager<AppRole>>();

        Console.WriteLine("🔥 SEED BAŞLADI");

        await context.Database.MigrateAsync();

        // -------------------------------
        // 1) ROLE SEED
        // -------------------------------
        if (!await roleManager.Roles.AnyAsync())
        {
            var result = await roleManager.CreateAsync(new AppRole { Name = "Admin" });

            if (!result.Succeeded)
            {
                Console.WriteLine("❌ ROLE OLUŞTURULAMADI:");
                foreach (var err in result.Errors)
                    Console.WriteLine($" - {err.Description}");
            }
            else Console.WriteLine("✔ ROLE OLUŞTURULDU: Admin");
        }
        else Console.WriteLine("ℹ Rol zaten var, geçiliyor...");

        // -------------------------------
        // 2) USER SEED
        // -------------------------------
        if (!await userManager.Users.AnyAsync())
        {
            var admin = new AppUser
            {
                Name = "Nurettin AKPINAR",
                UserName = "nurettinakpinar",
                Email = "nurettinakpinar1@hotmail.com"
            };

            var result = await userManager.CreateAsync(admin, "Admin123.");

            if (!result.Succeeded)
            {
                Console.WriteLine("❌ USER OLUŞTURULAMADI:");
                foreach (var err in result.Errors)
                    Console.WriteLine($" - {err.Description}");
            }
            else
            {
                Console.WriteLine("✔ USER OLUŞTURULDU: nurettinakpinar1@hotmail.com");

                var roleAssignResult = await userManager.AddToRoleAsync(admin, "Admin");

                if (!roleAssignResult.Succeeded)
                {
                    Console.WriteLine("❌ ROLE ATAMA HATASI:");
                    foreach (var err in roleAssignResult.Errors)
                        Console.WriteLine($" - {err.Description}");
                }
                else Console.WriteLine("✔ USER ROLE'E EKLENDİ (Admin)");
            }
        }
        else Console.WriteLine("ℹ User zaten var, geçiliyor...");

        // =============================
        // 3) TEAM SEED (Takımlar)
        // =============================
        if (!await context.Takimlar.AnyAsync())
        {
            context.Takimlar.AddRange(
                new Team { Aciklama = "Yazılım Teknolojileri", Active = true },
                new Team { Aciklama = "Kontrol Güdüm ve Seyrüsefer", Active = true },
                new Team { Aciklama = "Sistem", Active = true },
                new Team { Aciklama = "Donanım", Active = true },
                new Team { Aciklama = "Mekanik", Active = true }
            );
        }

        // =============================
        // 4) DEPARTMENT SEED (Birimler)
        // =============================
        if (!await context.Birimler.AnyAsync())
        {
            context.Birimler.Add(
                new Department { Aciklama = "FERGANİ", Active = true }
            );
        }

        await context.SaveChangesAsync();
        Console.WriteLine("🎉 SEED TAMAMLANDI");
    }
}
