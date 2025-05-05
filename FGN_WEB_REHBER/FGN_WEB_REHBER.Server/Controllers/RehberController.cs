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
        public async Task<IActionResult> GetCalisanlar(string? searchTerm, TakimEnum? takimEnum)
        {
            var query = _context.Employees.AsQueryable();

            if (!string.IsNullOrEmpty(searchTerm))
            {
                query = query.Where(e => e.AdSoyad.ToLower().Contains(searchTerm.ToLower()) ||
                                         e.IsCepTelNo.Contains(searchTerm));
            }

            if (takimEnum != null)
            {
                query = query.Where(e => e.Takim == takimEnum);
            }

            query = query.Where(e => e.TalepDurum == TalepDurumEnum.ONAY);

            var employees = await query.ToListAsync();

            var settings = new JsonSerializerSettings
            {
                Formatting = Formatting.Indented,
                Converters = new List<JsonConverter> { new StringEnumConverter() }
            };

            var jsonResult = JsonConvert.SerializeObject(employees, settings);
            return Ok(jsonResult);
        }

        [HttpGet("BilgileriGetir")]
        public async Task<IActionResult> BilgileriGetir()
        {
            CultureInfo culture = new CultureInfo("tr-TR");

            var bilgiResponse = new BilgiResponse
            {
                Birim = Enum.GetValues(typeof(BirimEnum))
                .Cast<BirimEnum>()
                .Select(e => new BilgiResponse.BilgInner
                {
                    id = (int)e,
                    aciklama = e.GetEnumDescription()
                }).ToList(),

                Takim = Enum.GetValues(typeof(TakimEnum))
                .Cast<TakimEnum>()
                .Select(e => new BilgiResponse.BilgInner
                {
                    id = (int)e,
                    aciklama = e.GetEnumDescription()
                }).ToList()
            };

            if (bilgiResponse != null)
            {
                return Ok(bilgiResponse);

            }
            return BadRequest(new ProblemDetails { Title = "Talep oluşturulurken bir hata meydana geldi. BT ekibi ile ilteşime geçiniz." });
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
                Birim = (BirimEnum)employeeDTO.Birim, // Enum olarak atıyoruz
                Takim = (TakimEnum)employeeDTO.Takim, // Enum olarak atıyoruz
                DahiliNo = !string.IsNullOrWhiteSpace(employeeDTO.DahiliNo) ? employeeDTO.DahiliNo : "-",
                IsCepTelNo = !string.IsNullOrWhiteSpace(employeeDTO.IsCepTelNo) ? employeeDTO.IsCepTelNo : "-"
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
