using System.ComponentModel;
using System.Reflection;

namespace FGN_WEB_REHBER.Server.Utils
{
    public static class EnumHelper
    {
        public static string GetEnumDescription<T>(this T value) where T : Enum
        {
            FieldInfo fi = value.GetType().GetField(value.ToString());
            if (fi != null)
            {
                DescriptionAttribute[] attributes = (DescriptionAttribute[])fi.GetCustomAttributes(typeof(DescriptionAttribute), false);
                if (attributes.Length > 0)
                {
                    return attributes[0].Description;
                }
            }
            return value.ToString(); // Eğer description yoksa enum adını döndür.
        }
    }
}
