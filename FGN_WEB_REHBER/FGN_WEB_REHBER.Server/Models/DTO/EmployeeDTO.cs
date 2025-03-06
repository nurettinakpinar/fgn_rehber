
using FGN_WEB_REHBER.Server.Models.Enums;

namespace FGN_WEB_REHBER.Server.DTO
{
    public class EmployeeDTO
    {
        public string Ad { get; set; } = null!;
        public string Soyad { get; set; } = null!;
        public BirimEnum Birim { get; set; }
        public TakimEnum Takim { get; set; }
        public string DahiliNo { get; set; } = null!;
        public string IsCepTelNo { get; set; } = null!;
    }

}
