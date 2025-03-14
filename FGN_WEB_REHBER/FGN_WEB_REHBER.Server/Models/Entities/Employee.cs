using FGN_WEB_REHBER.Server.Models.Enums;
using System.ComponentModel.DataAnnotations;

namespace FGN_WEB_REHBER.Server.Models.Entities
{
    public class Employee
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string AdSoyad { get; set; } = null!;
        public BirimEnum Birim { get; set; }
        public TakimEnum Takim { get; set; }
        public string? DahiliNo { get; set; } 
        public string? IsCepTelNo { get; set; }
        public bool Active { get; set; }
        public TalepDurumEnum TalepDurum { get; set; } = TalepDurumEnum.BEKLEMEDE;

    }
}
