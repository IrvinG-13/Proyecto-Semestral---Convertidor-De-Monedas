using System.Text.Json.Serialization;

namespace ProjectMoneyExchange.Models
{
    public class ModeloBilletera
    {

        public int ID_Movimiento { get; set; }
        public decimal Monto { get; set; }
        public string Categoria { get; set; }
        public string RegistroMoneda { get; set; }
        public string TipoMovimiento { get; set; }

        public decimal RegistroSaldo { get; set; }

        public string NewRegistroMoneda { get; set; }
        public DateTime FechaRegistro { get; set; }


        public int ID_Billetera { get; set; } //LLave Foranea que viene de tabla BILLETERA
        [JsonIgnore]

        public virtual ModeloSaldoBilletera ModeloSaldoBilletera { get; set; } //Propiedad de navegacion que nos permite conectar entre modelos // lado de muchos






    }

}
