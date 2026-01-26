using FGN_WEB_REHBER.Server.Data;
using FGN_WEB_REHBER.Server.Models.DTO;
using FGN_WEB_REHBER.Server.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FGN_WEB_REHBER.Server.Controllers
{
    [Authorize]
    [Route("api/Admin/[controller]")]
    [ApiController]
    public class TakimController : ControllerBase
    {
        private readonly DataContext _context;

        public TakimController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var takimlar = await _context.Takimlar
                .Select(t => new { t.Id, t.Aciklama, t.Active })
                .ToListAsync();

            return Ok(takimlar);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBirimTakimDto dto)
        {
            var takim = new Team
            {
                Aciklama = dto.aciklama,
                Active = true
            };

            _context.Takimlar.Add(takim);
            await _context.SaveChangesAsync();

            return Ok(takim);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateBirimTakimDto dto)
        {
            var takim = await _context.Takimlar.FindAsync(id);
            if (takim == null) return NotFound();

            takim.Aciklama = dto.aciklama;
            await _context.SaveChangesAsync();

            return Ok(takim);
        }
    }

}
