using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using ProjectMoneyExchange.Data;
using ProjectMoneyExchange.Models;
using ProjectMoneyExchange.Models.ModelosAPIS;
using System.ComponentModel.DataAnnotations;

namespace ProjectMoneyExchange.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class SaldoBilleteraController : ControllerBase
    {
        private readonly AplicacionDbContext _context;

        public SaldoBilleteraController(AplicacionDbContext context) //ver que hace esto, solo reutilicé
        {
            _context = context;
        }



        [HttpPut("upsert-saldo/{correoUsuario}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpsertSaldo(string correoUsuario, string tipoMovimiento, [FromBody] APIActualizarSaldo request)
        {
            // Validación 1: Verificar que la billetera existe
            var billetera = await _context.modeloSaldoBilletera
                .FirstOrDefaultAsync(b => b.Correo_User == correoUsuario);

            if (billetera == null)
            {
                return NotFound($"No se encontró billetera para el usuario: {correoUsuario}");
            }

            // Validación 2: Verificar que el request no sea nulo
            if (request == null)
            {
                return BadRequest("La solicitud no puede ser nula");
            }

            // Validación 3: Verificar que el saldo a operar sea positivo
            if (request.Saldo_Disponible <= 0)
            {
                return BadRequest("El monto debe ser mayor a 0");

            }

            if(request.Moneda_Actual.Length > 3 )
            {
                return BadRequest("El Nombre de la moneda no debe superar 3 Letras");
            }

            if (tipoMovimiento.ToUpper() == "INGRESO")
            {
                
                // Validación 4: Para ingresos, verificar que no exceda límites (opcional)
                decimal saldoMaximoPermitido = 1000000; // Ejemplo: máximo 1 millón
                if (billetera.Saldo_Disponible + request.Saldo_Disponible > saldoMaximoPermitido)
                {
                    return BadRequest($"El saldo no puede exceder ${saldoMaximoPermitido:N2}"); //N2 = NUMBER FORMAT, 2 DECIMALES
                }

                billetera.Saldo_Disponible += request.Saldo_Disponible;
                
                //valida que el campo de moneda, si esta vacio se queda la misma
                if(request.Moneda_Actual == "") { billetera.MonedaActual = billetera.MonedaActual; }
                else { billetera.MonedaActual = request.Moneda_Actual; }
            }
            else if (tipoMovimiento.ToUpper() == "GASTO")
            {
                // **VALIDACIÓN PRINCIPAL: Verificar saldo suficiente**
                if (billetera.Saldo_Disponible < request.Saldo_Disponible)
                {
                    return BadRequest($"Saldo insuficiente. Saldo actual: ${billetera.Saldo_Disponible:N2}, Intentaste retirar: ${request.Saldo_Disponible:N2}");
                }

                // Validación adicional: No permitir que quede en negativo después de la operación
                if (billetera.Saldo_Disponible - request.Saldo_Disponible < 0)
                {
                    return BadRequest("La operación dejaría el saldo en negativo");
                }

                billetera.Saldo_Disponible -= request.Saldo_Disponible;

                //valida que el campo de moneda, si esta vacio se queda la misma
                if (request.Moneda_Actual == "") { billetera.MonedaActual = billetera.MonedaActual; }
                else { billetera.MonedaActual = request.Moneda_Actual; }
            }
            else
            {
                return BadRequest("Tipo de movimiento no válido. Use 'INGRESO' o 'GASTO'");
            }

            await _context.SaveChangesAsync();
            return Ok(billetera);
        }



        [HttpGet("verSaldo/{correoUsuario}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]

        public async Task<IActionResult> verSaldo( string correoUsuario) 
        {
            try
            {
                // Buscar la billetera por correo
                var billetera = await _context.modeloSaldoBilletera
                    .FirstOrDefaultAsync(b => b.Correo_User == correoUsuario);

                if (billetera == null)
                {
                    return NotFound(new
                    {
                        mensaje = "No se encontró billetera para el usuario",
                        correoUsuario = correoUsuario
                    });
                }

                return Ok(new
                {
                    mensaje = "Saldo obtenido exitosamente",
                    id_billetera = billetera.ID_Billetera,
                    correo_usuario = billetera.Correo_User,
                    saldo_disponible = billetera.Saldo_Disponible,
                    moneda_actual = billetera.MonedaActual,
                    saldo_formateado = $"${billetera.Saldo_Disponible:N2} {billetera.MonedaActual}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    mensaje = "Error al obtener el saldo",
                    error = ex.Message
                });
            }

        }



    }
}
