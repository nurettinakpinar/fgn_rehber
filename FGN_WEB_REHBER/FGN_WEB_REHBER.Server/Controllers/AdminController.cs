using FGN_WEB_REHBER.Server.Data;
using FGN_WEB_REHBER.Server.DTO;
using FGN_WEB_REHBER.Server.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Text.Json;

namespace FGN_WEB_REHBER.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly DataContext _context;

        public AdminController(DataContext context)
        {
            _context = context;
        }



        [HttpPost("talep-onayla/{Id}")]
        public async Task<IActionResult> YeniCalisanTalepOnayla(int Id)
        {
            var employee = await _context.Employees.FindAsync(Id);
            if (employee == null)
                return NotFound("Çalışan Bulunamadı!");

            employee.TalepDurum = TalepDurumEnum.ONAY;
            employee.Active = true;

            var result = await _context.SaveChangesAsync() > 0;
            return result
                ? await GetAllEmployeesAsJson()
                : BadRequest(new ProblemDetails { Title = "Kayıt güncellenemedi." });
        }

        [HttpPost("talep-reddet/{Id}")]
        public async Task<IActionResult> YeniCalisanTalepReddet(int Id)
        {
            var employee = await _context.Employees.FindAsync(Id);
            if (employee == null)
                return NotFound("Çalışan Bulunamadı!");

            employee.TalepDurum = TalepDurumEnum.RED;
            employee.Active = false;

            var result = await _context.SaveChangesAsync() > 0;
            return result
                ? await GetAllEmployeesAsJson()
                : BadRequest(new ProblemDetails { Title = "Kayıt güncellenemedi." });
        }

        [HttpPut("calisanGuncelle/{id}")]
        public async Task<IActionResult> CalisanGuncelle(int id, [FromBody] EmployeeDTO employeeDTO)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
                return NotFound("Çalışan Bulunamadı!");

            employee.AdSoyad = employeeDTO.Ad + " " + employeeDTO.Soyad;
            employee.BirimId = employeeDTO.BirimId;
            employee.TakimId = employeeDTO.TakimId;
            employee.DahiliNo = employeeDTO.DahiliNo;
            employee.IsCepTelNo = employeeDTO.IsCepTelNo;
            employee.TalepDurum = TalepDurumEnum.BEKLEMEDE;

            var result = await _context.SaveChangesAsync() > 0;
            return result
                ? await GetAllEmployeesAsJson()
                : BadRequest(new ProblemDetails { Title = "Kayıt güncellenemedi." });
        }


        private async Task<IActionResult> GetAllEmployeesAsJson()
        {
            var employees = await _context.Employees
                                            .Include(e => e.Birim)
                                            .Include(e => e.Takim)
                                            .Select(e => new
                                            {
                                                Id = e.Id,
                                                AdSoyad = e.AdSoyad,
                                                BirimId = e.BirimId,
                                                TakimId = e.TakimId,
                                                Birim = e.Birim.Aciklama,
                                                Takim = e.Takim.Aciklama,
                                                DahiliNo = e.DahiliNo,
                                                IsCepTelNo = e.IsCepTelNo,
                                                Active = e.Active,
                                                TalepDurum = e.TalepDurum.ToString(),
                                                FotoUrl = e.FotoUrl
                                            }).ToListAsync();
            return new JsonResult(employees, new JsonSerializerOptions
            {
                PropertyNamingPolicy = null
            });
        }

        [HttpPost("calisan-foto/{id}")]
        public async Task<IActionResult> CalisanFotoYukle(int id, IFormFile foto)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound("Çalışan Bulunamadı!");

            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png" };
            if (!allowedTypes.Contains(foto.ContentType.ToLower()))
                return BadRequest(new ProblemDetails { Title = "Sadece JPG ve PNG formatları desteklenmektedir." });
            if (foto.Length > 2 * 1024 * 1024)
                return BadRequest(new ProblemDetails { Title = "Dosya boyutu en fazla 2 MB olabilir." });

            var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "photos");
            Directory.CreateDirectory(uploadsDir);

            if (!string.IsNullOrEmpty(employee.FotoUrl))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", employee.FotoUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(oldPath)) System.IO.File.Delete(oldPath);
            }

            var ext = Path.GetExtension(foto.FileName).ToLowerInvariant();
            var fileName = $"{id}{ext}";
            var filePath = Path.Combine(uploadsDir, fileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
                await foto.CopyToAsync(stream);

            employee.FotoUrl = $"/uploads/photos/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { FotoUrl = employee.FotoUrl });
        }

        [HttpDelete("calisan-foto/{id}")]
        public async Task<IActionResult> CalisanFotoSil(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return NotFound("Çalışan Bulunamadı!");

            if (!string.IsNullOrEmpty(employee.FotoUrl))
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", employee.FotoUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);
                employee.FotoUrl = null;
                await _context.SaveChangesAsync();
            }

            return NoContent();
        }

        [HttpGet]
        public async Task<IActionResult> GetCalisanlar()
        {
            return await GetAllEmployeesAsJson();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> CalisanSil(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
                return NotFound("Çalışan Bulunamadı!");

            if (!string.IsNullOrEmpty(employee.FotoUrl))
            {
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", employee.FotoUrl.TrimStart('/').Replace('/', Path.DirectorySeparatorChar));
                if (System.IO.File.Exists(filePath)) System.IO.File.Delete(filePath);
            }

            _context.Employees.Remove(employee);
            var result = await _context.SaveChangesAsync() > 0;
            return result
                ? NoContent()
                : BadRequest(new ProblemDetails { Title = "Kayıt silinemedi." });
        }
    }
}
