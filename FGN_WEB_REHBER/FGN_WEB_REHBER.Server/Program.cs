using FGN_WEB_REHBER.Server.Data;
using FGN_WEB_REHBER.Server.Middlewares;
using FGN_WEB_REHBER.Server.Models.Entities;
using FGN_WEB_REHBER.Server.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace FGN_WEB_REHBER.Server
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // -------------------- DATABASE --------------------
            builder.Services.AddDbContext<DataContext>(options =>
            {
                var config = builder.Configuration;
                var connectionString = config.GetConnectionString("defaultConnection");
                options.UseSqlServer(connectionString);
            });

            // -------------------- IDENTITY --------------------
            builder.Services.AddIdentity<AppUser, AppRole>()
                .AddEntityFrameworkStores<DataContext>();

            builder.Services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireDigit = false;

                options.User.AllowedUserNameCharacters =
                    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+";
                options.User.RequireUniqueEmail = true;
            });

            // -------------------- JWT AUTH --------------------
            builder.Services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

            }).AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false; // Docker için gerekli
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidIssuer = "nurettinakpinar.com",
                    ValidateAudience = false,
                    ValidAudience = "nurettin",
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.ASCII.GetBytes(builder.Configuration["JWTSecurity:SecretKey"]!)
                    ),
                    ValidateLifetime = true,
                };
            });

            // -------------------- CONTROLLERS & SWAGGER --------------------
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            builder.Services.AddScoped<TokenService>();

            // -------------------- CORS --------------------
            var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"] ?? "http://localhost:3000";
            var origins = allowedOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(origins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            var app = builder.Build();

            // -------------------- MIDDLEWARE --------------------
            app.UseMiddleware<ExceptionHandling>();

            app.UseDefaultFiles();
            app.UseStaticFiles();

            // Docker volume'dan gelen uploads klasörünü açıkça serve et
            var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "wwwroot", "uploads");
            Directory.CreateDirectory(uploadsPath);
            app.UseStaticFiles(new StaticFileOptions
            {
                FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(uploadsPath),
                RequestPath = "/uploads"
            });

            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowFrontend");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            // React SPA fallback — sadece index.html mevcutsa devreye girer (dev ortamı)
            // Docker'da React nginx'te olduğu için API container'da index.html yoktur
            var indexHtmlPath = Path.Combine(app.Environment.WebRootPath ?? "", "index.html");
            if (File.Exists(indexHtmlPath))
                app.MapFallbackToFile("/index.html");

            // -------------------- DATABASE INIT --------------------
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<DataContext>();
                try
                {
                    db.Database.Migrate();
                    SeedDatabase.InitializeAsync(app);
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Migration/Seed hatası: " + ex.Message);
                }
            }


            app.Run();
        }
    }
}
