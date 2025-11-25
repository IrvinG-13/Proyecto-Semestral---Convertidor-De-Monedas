using System.Text.Json.Serialization;

namespace ProjectMoneyExchange.Models.ModelosAPIS
{
    public class APILoginResponse
    {
        public string Mensaje { get; set; }
        public string Correo_User { get; set; }
        public string Nombre_User { get; set; }

        //[JsonIgnore]
        public int ID_Billetera { get; set; } // para darle a la pagina el id Billetera
    }
}
