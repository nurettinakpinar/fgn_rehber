namespace FGN_WEB_REHBER.Server.Models.Response
{
    public class BilgiResponse
    {
        public List<BilgInner> Birim { get; set; } 
        public List<BilgInner> Takim { get; set; }

     
        public class BilgInner
        {
            public int id { get; set; }
            public string aciklama { get; set; } = null!;
        }
    }

}
