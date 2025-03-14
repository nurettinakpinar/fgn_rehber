using System.Text;
using FGN_WEB_REHBER.Server.Data;
using FGN_WEB_REHBER.Server.Models.Entities;
using FGN_WEB_REHBER.Server.Middlewares;
using FGN_WEB_REHBER.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace FGN_WEB_REHBER.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddDbContext<DataContext>(options =>
            {
                var config = builder.Configuration;
                var connectionString = config.GetConnectionString("defaultConnection");

                options.UseSqlite(connectionString);
            });

            // Adds Identity services to the application for user authentication and role management.
            // - `AppUser` represents the user entity (custom user model).
            // - `AppRole` represents the role entity (custom role model).
            // - `AddEntityFrameworkStores<DataContext>()` integrates Identity with Entity Framework Core, 
            //   allowing Identity to use the `DataContext` database to store users and roles.
            builder.Services.AddIdentity<AppUser, AppRole>().AddEntityFrameworkStores<DataContext>();

            builder.Services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireDigit = false;

                options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                options.User.RequireUniqueEmail = true;
            });

            builder.Services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

            }).AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidIssuer = "nurettinakpinar.com",
                    ValidateAudience = false,
                    ValidAudience = "nurettin",
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["JWTSecurity:SecretKey"]!)),
                    ValidateLifetime = true,
                };
            });

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddScoped<TokenService>();

            var app = builder.Build();

            app.UseMiddleware<ExceptionHandling>();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            // CORS Configuration: 
            // This allows requests from 'http://localhost:50614' (React frontend) to access this API.
            // It permits any HTTP headers and any HTTP methods (GET, POST, PUT, DELETE, etc.).
            // Make sure this origin matches the frontend running in development.
            app.UseCors(opt =>
            {
                opt.AllowAnyHeader().AllowAnyMethod().AllowCredentials().WithOrigins("https://localhost:50614");
            });
            app.UseAuthorization();


            app.MapControllers();

            app.MapFallbackToFile("/index.html");

            SeedDatabase.Initialize(app);

            app.Run();
        }
    }
}
