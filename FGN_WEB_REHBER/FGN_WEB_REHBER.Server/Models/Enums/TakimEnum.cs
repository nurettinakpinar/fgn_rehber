using FGN_WEB_REHBER.Server.Utils;
using Newtonsoft.Json;
using System.ComponentModel;

namespace FGN_WEB_REHBER.Server.Models.Enums
{
    [JsonConverter(typeof(DescriptionEnumConverter))]
    public enum TakimEnum
    {
        [Description("Yazılım Teknolojileri")] YZT,
        [Description("Kontrol Güdüm Ve Seyrüsefer")] KONT,
        [Description("Sistem")] SIS,
        [Description("Donanım")] DON,
        [Description("Mekanik")] MEK,
    }
}