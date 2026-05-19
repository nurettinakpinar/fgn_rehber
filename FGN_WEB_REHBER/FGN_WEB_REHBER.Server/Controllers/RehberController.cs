using FGN_WEB_REHBER.Server.Data;
using FGN_WEB_REHBER.Server.DTO;
using FGN_WEB_REHBER.Server.Models.Entities;
using FGN_WEB_REHBER.Server.Models.Enums;
using FGN_WEB_REHBER.Server.Models.Response;
using FGN_WEB_REHBER.Server.Utils;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.Globalization;
using System.Text.Json;

namespace FGN_WEB_REHBER.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RehberController : ControllerBase
    {
        private readonly DataContext _context;

        public RehberController(DataContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCalisanlar(string? searchTerm, int? takimId, int? birimId)
        {
            var query = _context.Employees.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.Trim();

                query = query.Where(e =>
                    EF.Functions.Collate(e.AdSoyad, "Turkish_CI_AS").Contains(term) ||
                    e.IsCepTelNo.Contains(term)
                );
            }

            if (takimId != null)
                query = query.Where(e => e.TakimId == takimId);

            if (birimId != null)
                query = query.Where(e => e.BirimId == birimId);

            query = query.Where(e => e.TalepDurum == TalepDurumEnum.ONAY && e.Birim.Active == true && e.Takim.Active == true);

            var employees = await query
                 .Include(e => e.Takim)
                 .Include(e => e.Birim)
                 .Select(e => new
                 {
                     e.Id,
                     e.AdSoyad,
                     Birim = e.Birim.Aciklama,
                     Takim = e.Takim.Aciklama,
                     e.DahiliNo,
                     e.IsCepTelNo
                 })
                 .ToListAsync();

            return new JsonResult(employees, new JsonSerializerOptions
            {
                PropertyNamingPolicy = null
            });

        }

        [HttpGet("BilgileriGetir")]
        public async Task<IActionResult> BilgileriGetir()
        {
            var birimler = await _context.Birimler
                .Where(b => b.Active)
                .Select(b => new { b.Id, b.Aciklama })
                .ToListAsync();

            var takimlar = await _context.Takimlar
                .Where(t => t.Active)
                .Select(t => new { t.Id, t.Aciklama })
                .ToListAsync();

            return Ok(new { birimler, takimlar });
        }

        [HttpGet("TalepBilgileriGetir")]
        public async Task<IActionResult> TalepBilgileriGetir()
        {
            var isAdmin = User.IsInRole("admin");

            var birimler = await _context.Birimler
                .Where(b => b.Active)
                .Select(b => new { b.Id, b.Aciklama })
                .ToListAsync();

            var takimQuery = _context.Takimlar.Where(t => t.Active);
            if (!isAdmin)
                takimQuery = takimQuery.Where(t => !t.IsGizli);

            var takimlar = await takimQuery
                .Select(t => new { t.Id, t.Aciklama })
                .ToListAsync();

            return Ok(new { birimler, takimlar });
        }


        [HttpPost("talep-olustur")]
        public async Task<ActionResult> YeniCalisanTalepOlustur([FromBody] EmployeeDTO employeeDTO)
        {
            if (employeeDTO == null)
            {
                return BadRequest(new ProblemDetails { Title = "Geçersiz veri, lütfen tüm alanları doldurun." });
            }

            CultureInfo culture = new CultureInfo("tr-TR");
            TextInfo textInfo = culture.TextInfo; // Büyük harf dönüşümü için

            var employee = new Employee
            {
                AdSoyad = employeeDTO.Ad.ToLower() + " " + employeeDTO.Soyad.ToLower(),
                BirimId = employeeDTO.BirimId,
                TakimId = employeeDTO.TakimId,
                DahiliNo = employeeDTO.DahiliNo ?? "-",
                IsCepTelNo = employeeDTO.IsCepTelNo ?? "-"
            };

            _context.Employees.Add(employee);
            var result = await _context.SaveChangesAsync() > 0;

            if (result)
            {
                // CreatedAtAction kullanımı düzeltildi
                return CreatedAtAction(nameof(YeniCalisanTalepOlustur), new { id = employee.Id }, new
                {
                    Message = "Talebiniz başarıyla alındı. Bilgi Teknolojileri ekibi tarafından incelendikten sonra ekleme yapılacaktır.",
                    EmployeeId = employee.Id
                });
            }

            return BadRequest(new ProblemDetails { Title = "Talep oluşturulurken bir hata meydana geldi. BT ekibi ile iletişime geçiniz." });
        }


    }
}
