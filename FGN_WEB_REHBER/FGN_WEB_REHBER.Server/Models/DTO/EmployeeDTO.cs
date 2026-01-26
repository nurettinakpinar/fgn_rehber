namespace FGN_WEB_REHBER.Server.DTO
{
    public class EmployeeDTO
    {
        public string Ad { get; set; } = null!;
        public string Soyad { get; set; } = null!;

        public int TakimId { get; set; }
        public int BirimId { get; set; }

        public string? DahiliNo { get; set; }
        public string? IsCepTelNo { get; set; }
    }
}
