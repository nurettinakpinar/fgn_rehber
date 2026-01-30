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
    public class BirimController : ControllerBase
    {
        private readonly DataContext _context;

        public BirimController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var birimler = await _context.Birimler
                .Select(b => new { b.Id, b.Aciklama, b.Active })
                .ToListAsync();

            return Ok(birimler);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateBirimTakimDto dto)
        {
            var birim = new Department
            {
                Aciklama = dto.aciklama,
                Active = true
            };

            _context.Birimler.Add(birim);
            await _context.SaveChangesAsync();

            return Ok(birim);
        }

        [HttpPut("{id}/aciklama")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateBirimTakimDto dto)
        {
            var birim = await _context.Birimler.FindAsync(id);
            if (birim == null) return NotFound();

            birim.Aciklama = dto.aciklama;
            await _context.SaveChangesAsync();

            return Ok(birim);
        }

        [HttpPut("{id}/active")]
        public async Task<IActionResult> Update_active(int id, [FromBody] UpdateActiveDto dto)
        {
            var birim = await _context.Birimler.FindAsync(id);
            if (birim == null) return NotFound();

            birim.Active = dto.active;
            await _context.SaveChangesAsync();

            return Ok(birim);
        }
    }

}
