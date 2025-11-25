using System.Text.Json.Serialization;

namespace ProjectMoneyExchange.Models.ModelosAPIS
{
    public class APILoginRequest
    {
        public string Correo_User { get; set; }
        public string Contraseña_User { get; set; }

        
    }
}
