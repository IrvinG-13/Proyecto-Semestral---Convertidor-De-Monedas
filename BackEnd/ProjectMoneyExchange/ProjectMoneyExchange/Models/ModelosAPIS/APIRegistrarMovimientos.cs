using Microsoft.AspNetCore.Mvc;

namespace ProjectMoneyExchange.Models.ModelosAPIS
{
    public class APIRegistrarMovimientos 
    {
        public decimal Monto { get; set; }
        public string Categoria { get; set; }
        public string RegistroMoneda { get; set; }
        public string TipoMovimiento { get; set; }
    }
}
