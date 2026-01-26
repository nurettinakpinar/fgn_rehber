using FGN_WEB_REHBER.Server.Models.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FGN_WEB_REHBER.Server.Data
{
    public class DataContext(DbContextOptions options) : IdentityDbContext<AppUser, AppRole, string>(options)
    {
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<Team> Takimlar { get; set; }
        public DbSet<Department> Birimler { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // 🔹 Employee → Team (Many-to-One)
            builder.Entity<Employee>()
                .HasOne(e => e.Takim)
                .WithMany(t => t.Employees)
                .HasForeignKey(e => e.TakimId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🔹 Employee → Department (Many-to-One)
            builder.Entity<Employee>()
                .HasOne(e => e.Birim)
                .WithMany(b => b.Employees)
                .HasForeignKey(e => e.BirimId)
                .OnDelete(DeleteBehavior.Restrict);

            // 🔹 TalepDurum enumunu string sakla (bunu tutuyoruz)
            builder.Entity<Employee>()
                .Property(e => e.TalepDurum)
                .HasConversion<string>()
                .HasColumnType("nvarchar(20)");
        }
    }
}
