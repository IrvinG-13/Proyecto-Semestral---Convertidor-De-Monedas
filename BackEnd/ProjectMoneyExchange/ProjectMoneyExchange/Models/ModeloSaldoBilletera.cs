using System.Text.Json.Serialization;

namespace ProjectMoneyExchange.Models
{
    public class ModeloSaldoBilletera
    {

        public int ID_Billetera { get; set; }

        public decimal Saldo_Disponible { get; set; }

        public string MonedaActual {  get; set; }

        public string Correo_User { get; set; } // FK obtenida de Usuario

        //Puente navegacion
        public virtual ModeloUsuario ModeloUsuario { get; set; } // 

        public virtual ICollection<ModeloBilletera> ModeloBilletera { get; set; } // lado de uno







        /*public void CalcularSaldoNuevo()
        {
            if (Saldo_Disponible >0)
            {
                Saldo_Disponible = ObtenerSaldoNuevo();
            }
        }
        public decimal ObtenerSaldoNuevo(decimal saldo_Disponible, decimal monto, string tipoMovimiento)
        {

            if( tipoMovimiento == "GASTO")
            {
                if (Saldo_Disponible == 0) { return 0; }
                return saldo_Disponible - monto ;

            }
            else if(tipoMovimiento == "INGRESO")
            {
                return saldo_Disponible + monto ;
            }

            return 0;


        } */
    }

    
}
