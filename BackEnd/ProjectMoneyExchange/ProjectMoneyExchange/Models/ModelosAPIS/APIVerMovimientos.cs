

namespace ProjectMoneyExchange.Models.ModelosAPIS
{
    public class APIVerMovimientos
    {
        
        public int ID_Movimiento { get; set; }
        public decimal Monto { get; set; }
        public string Categoria { get; set; }
        public string Descripcion { get; set; }
        public string RegistroMoneda { get; set; }
        public string TipoMovimiento { get; set; }
        public DateTime FechaRegistro { get; set; }
 
    }
}
