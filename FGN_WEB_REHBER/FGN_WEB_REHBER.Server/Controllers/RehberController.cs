using FGN_WEB_REHBER.Server.Data;
using FGN_WEB_REHBER.Server.DTO;
using FGN_WEB_REHBER.Server.Models.Entities;
using FGN_WEB_REHBER.Server.Models.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Extensions;
using System;
using System.Globalization;
using static System.Net.Mime.MediaTypeNames;

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
                query = query.Where(e => e.AdSoyad.Contains(searchTerm) ||
                e.IsCepTelNo.Contains(searchTerm) ||
                takimEnum != null ? e.Takim == takimEnum : false);
            }
            var employees = await query.ToListAsync();
            return Ok(employees);
        }

        [HttpPost("talep-olustur")]
        public async Task<IActionResult> YeniCalisanTalepOlustur(EmployeeDTO employeeDTO)
        {
            CultureInfo culture = new CultureInfo("tr-TR");

            var employee = new Employee
            {
                AdSoyad = employeeDTO.Ad.ToLower(culture) + " " + employeeDTO.Soyad.ToLower(culture),
                Birim = employeeDTO.Birim,
                Takim = employeeDTO.Takim,
                DahiliNo = employeeDTO.DahiliNo != null ? employeeDTO.DahiliNo : "-",
                IsCepTelNo = employeeDTO.IsCepTelNo != null ? employeeDTO.IsCepTelNo : "-"
            };

            _context.Employees.Add(employee);
            var result = await _context.SaveChangesAsync() > 0;
            if (result)
            {
                return Ok("Talebiniz Başarıyla Alındı Bilgi Teknolojileri ekibi tarafından incelendikten sonra ekleme yapılacaktır.");
            }

            return BadRequest(new ProblemDetails { Title = "Talep oluşturulurken bir hata meydana geldi. BT ekibi ile ilteşime geçiniz." });
        }

        [HttpPost("talep-onayla/{Id}")]
        public async Task<IActionResult> YeniCalisanTalepOnayla(int Id)
        {
            var employee = await _context.Employees.FindAsync(Id);
            if (employee == null)
            {
                return NotFound("Çalışan Bulunamadı!");
            }

            employee.TalepDurum = Models.Enums.TalepDurumEnum.ONAY;
            employee.Active = true;

            var result = await _context.SaveChangesAsync() > 0;
            if (result)
            {
                return Ok("Çalışan Başarıyla Kaydedilmiştir.");
            }
            return BadRequest(new ProblemDetails { Title = "OKTAY NURETTIN-HALİTLE KONUŞ DURUM VAHİM :( DB GG GALİBA KESBİŞ OLSUN" });
        }


        [HttpPost("talep-reddet/{Id}")]
        public async Task<IActionResult> YeniCalisanTalepReddet(int Id)
        {
            var employee = await _context.Employees.FindAsync(Id);
            if (employee == null)
            {
                return NotFound("Çalışan Bulunamadı!");
            }

            employee.TalepDurum = Models.Enums.TalepDurumEnum.RED;
            employee.Active = false;

            var result = await _context.SaveChangesAsync() > 0;
            if (result)
            {
                return Ok("Çalışanın talebi reddedilmiştir.");
            }

            return BadRequest(new ProblemDetails { Title = "OKTAY NURETTIN-HALİTLE KONUŞ DURUM VAHİM :( DB GG GALİBA KESBİŞ OLSUN" });
        }
    }
}
