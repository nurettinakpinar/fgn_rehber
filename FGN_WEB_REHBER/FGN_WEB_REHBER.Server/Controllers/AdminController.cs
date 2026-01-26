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
                                                TalepDurum = e.TalepDurum.ToString()
                                            }).ToListAsync();
            return new JsonResult(employees, new JsonSerializerOptions
            {
                PropertyNamingPolicy = null
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetCalisanlar()
        {
            return await GetAllEmployeesAsJson();
        }
    }
}
