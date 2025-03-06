using FGN_WEB_REHBER.Server.Models.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FGN_WEB_REHBER.Server.Data
{
    public class DataContext(DbContextOptions options) : IdentityDbContext<AppUser, AppRole, string>(options)
    {
        public DbSet<Employee> Employees => Set<Employee>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            builder.Entity<Employee>()
                .Property(e => e.TalepDurum)
                .HasConversion<string>()
                .HasColumnType("nvarchar(20)");

            builder.Entity<Employee>()
                 .Property(e => e.Birim)
                 .HasConversion<string>()
                 .HasColumnType("nvarchar(20)");

            builder.Entity<Employee>()
                 .Property(e => e.Takim)
                 .HasConversion<string>()
                 .HasColumnType("nvarchar(50)");
            base.OnModelCreating(builder);
        }
    }
}
