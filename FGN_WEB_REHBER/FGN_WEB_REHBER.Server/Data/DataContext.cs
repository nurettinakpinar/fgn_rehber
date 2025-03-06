using FGN_WEB_REHBER.Server.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FGN_WEB_REHBER.Server.Data
{
    public class DataContext(DbContextOptions options) : IdentityDbContext<AppUser, AppRole, string>(options)
    {
        public DbSet<Employee> Employees => Set<Employee>();
    }
}
