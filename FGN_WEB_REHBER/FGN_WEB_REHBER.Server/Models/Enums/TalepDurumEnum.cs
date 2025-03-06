using System.ComponentModel;

namespace FGN_WEB_REHBER.Server.Models.Enums
{
    public enum TalepDurumEnum
    {
        [Description("Beklemede")] BEKLEMEDE,
        [Description("Onaylandı")] ONAY,
        [Description("Reddedildi")] RED,
    }
}