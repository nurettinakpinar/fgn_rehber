namespace FGN_WEB_REHBER.Server.Models.Entities
{
    public class AdminSilmeLog
    {
        public int Id { get; set; }
        public string SilinenKullaniciAdi { get; set; } = "";
        public string SilinenAd { get; set; } = "";
        public string SilenKullaniciAdi { get; set; } = "";
        public string SilenAd { get; set; } = "";
        public DateTime IslemZamani { get; set; } = DateTime.UtcNow;
    }
}
