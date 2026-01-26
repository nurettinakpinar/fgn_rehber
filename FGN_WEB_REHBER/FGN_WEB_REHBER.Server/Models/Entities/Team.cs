namespace FGN_WEB_REHBER.Server.Models.Entities
{
    public class Team
    {
        public int Id { get; set; }
        public string Aciklama { get; set; } = null!;
        public bool Active { get; set; } = true;

        public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    }
}
