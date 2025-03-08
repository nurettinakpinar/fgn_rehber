using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System.ComponentModel;
using System.Reflection;

namespace FGN_WEB_REHBER.Server.Utils
{
    public class DescriptionEnumConverter : StringEnumConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (value != null)
            {
                FieldInfo field = value.GetType().GetField(value.ToString());
                DescriptionAttribute attribute = field?.GetCustomAttribute<DescriptionAttribute>();
                writer.WriteValue(attribute != null ? attribute.Description : value.ToString());
            }
            else
            {
                writer.WriteNull();
            }
        }
    }
}