using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ProjectMoneyExchange.Models
{
    public class ModeloUsuario
    {

        public string Nombre_User { get; set; }
        public string Apellido_User { get; set; }
        public string Correo_User { get; set; }
        public string Contraseña_User { get; set; }

        [JsonIgnore]
        public virtual ICollection<ModeloBilletera> Movimientos { get; set; } // lado de uno

    }
}
