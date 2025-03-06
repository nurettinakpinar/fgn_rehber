using System.ComponentModel.DataAnnotations;

namespace FGN_WEB_REHBER.Server.Entities
{
    public class Employee
    {
        [Key]
        public int Id { get; set; }
        [Required]
        public string AdSoyad { get; set; } = null!;
        public string Birim { get; set; } = null!;
        public string Takim { get; set; } = null!;
        public string Dahili { get; set; } = null!;
        public string IsCepTelNo { get; set; } = null!;

    }
}
