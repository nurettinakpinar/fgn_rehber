using FGN_WEB_REHBER.Server.Data;
using FGN_WEB_REHBER.Server.Models.DTO;
using FGN_WEB_REHBER.Server.Models.Entities;
using FGN_WEB_REHBER.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace FGN_WEB_REHBER.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AccountController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly TokenService _tokenService;

        private readonly DataContext _context;
        public AccountController(UserManager<AppUser> userManager, TokenService tokenService, DataContext context)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _context = context;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDTO>> Login(LoginDTO model)
        {
            var user = await _userManager.FindByNameAsync(model.UserName);
            if (user == null)
            {
                return BadRequest(new ProblemDetails { Title = "Invalid username" });
            }

            var result = await _userManager.CheckPasswordAsync(user, model.Password);

            if (result)
            {
                return Ok(new UserDTO
                {
                    Name = user.Name!,
                    Token = await _tokenService.GenerateToken(user) // Token döndürülüyor ama cookie'ye kaydedilmiyor.
                });
            }

            return Unauthorized();
        }

        [Authorize]
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDTO model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest();
            }
            var user = new AppUser
            {
                Name = model.Name,
                UserName = model.UserName,
                Email = model.Email,
            };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(user, "admin");
                return StatusCode(201);
            }

            return BadRequest(result.Errors);
        }

        [Authorize]
        [HttpGet("getuser")]
        public async Task<ActionResult<UserDTO>> GetUser()
        {
            var user = await _userManager.FindByNameAsync(User.Identity?.Name!);
            if (user == null)
            {
                return BadRequest(new ProblemDetails { Title = "username hatalı" });
            }
            var test = new UserDTO
            {
                Name = user.Name!,
                Token = await _tokenService.GenerateToken(user)
            };
            return test;
        }

        [Authorize]
        [HttpPut("change-password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDTO model)
        {
            var user = await _userManager.FindByNameAsync(User.Identity!.Name!);
            if (user == null) return Unauthorized();
            var result = await _userManager.ChangePasswordAsync(user, model.CurrentPassword, model.NewPassword);
            if (result.Succeeded) return NoContent();
            return BadRequest(new ProblemDetails { Title = result.Errors.First().Description });
        }

        [Authorize]
        [HttpGet("users")]
        public async Task<ActionResult<List<AdminUserDTO>>> GetUsers()
        {
            var admins = await _userManager.GetUsersInRoleAsync("admin");
            return admins.Select(u => new AdminUserDTO
            {
                Id = u.Id,
                Name = u.Name!,
                UserName = u.UserName!
            }).ToList();
        }

        [Authorize]
        [HttpGet("delete-logs")]
        public async Task<ActionResult<List<AdminSilmeLog>>> GetDeleteLogs()
        {
            var logs = await _context.AdminSilmeLoglari
                .OrderByDescending(l => l.IslemZamani)
                .ToListAsync();
            return logs;
        }

        [Authorize]
        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var silinecek = await _userManager.FindByIdAsync(id);
            if (silinecek == null) return NotFound();

            var silen = await _userManager.FindByNameAsync(User.Identity!.Name!);
            if (silen == null) return Unauthorized();

            // Kendini silemesin
            if (silinecek.Id == silen.Id)
                return BadRequest(new ProblemDetails { Title = "Kendi hesabınızı silemezsiniz." });

            // Silmeden önce log bilgilerini sakla
            var silinecekUserName = silinecek.UserName!;
            var silinecekAd = silinecek.Name ?? "";

            var result = await _userManager.DeleteAsync(silinecek);
            if (!result.Succeeded)
                return BadRequest(new ProblemDetails { Title = result.Errors.First().Description });

            // Silme başarılı — log kaydını ayrıca dene
            try
            {
                _context.AdminSilmeLoglari.Add(new FGN_WEB_REHBER.Server.Models.Entities.AdminSilmeLog
                {
                    SilinenKullaniciAdi = silinecekUserName,
                    SilinenAd = silinecekAd,
                    SilenKullaniciAdi = silen.UserName!,
                    SilenAd = silen.Name ?? "",
                    IslemZamani = DateTime.UtcNow
                });
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UYARI] Silme logu kaydedilemedi: {ex.Message}");
            }

            return NoContent();
        }
    }
}
