using FGN_WEB_REHBER.Server.Data;
using FGN_WEB_REHBER.Server.Models.DTO;
using FGN_WEB_REHBER.Server.Models.Entities;
using FGN_WEB_REHBER.Server.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

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
    }
}
