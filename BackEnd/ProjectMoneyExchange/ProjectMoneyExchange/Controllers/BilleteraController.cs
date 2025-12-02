using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;
using ProjectMoneyExchange.Data;
using ProjectMoneyExchange.Models;
using ProjectMoneyExchange.Models.ModelosAPIS;


namespace ProjectMoneyExchange.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BilleteraController : ControllerBase
    {

        private readonly AplicacionDbContext _context;

        public BilleteraController(AplicacionDbContext context)
        {
            _context = context;
        }

        /*[HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]

        public async Task<ActionResult<ModeloBilletera>> IngresoMovimientos([FromBody] ModeloBilletera model)
        {
            //VALIDACION DE DATOS

            if (model.Monto <= 0)
            {
                return BadRequest(new
                {
                    mensaje = " El Monto debe ser mayor a 0",
                    errores = new
                    {
                        Monto = model.Monto <= 0 ? "Debe ser mayor a 0" : null,
                    }
                });
            }

            // VALIDACION DE CATEGORIA

            if (model.Categoria == "")
            {
                return BadRequest(new
                {
                    mensaje = "La Categoria es obligatoria"
                });
            }
            // VALIDACION EN TIPO DE MONEDA
            if (model.RegistroMoneda == "")
            {
                return BadRequest(new
                {
                    mensaje = "Error al colocar tipo de moneda"
                });
            }

            //VALIDACION DE TIPO DE MOVIMIENTO

            if(model.TipoMovimiento == "")
            {
                return BadRequest(new
                {
                    mensaje = "Escoger tipo de movimiento es obligatorio"
                }
                    );
            }

            try
            {
                //GUARDAMOS EN LA BASE DE DATOS
                _context.modeloBilleteras.Add(model);
                await _context.SaveChangesAsync();

                //RESPUESTA DEL API

                return CreatedAtAction(
                    nameof(ObtenerPorId),
                    new { id = model.ID_Movimiento },
                    new
                    {
                        id = model.ID_Movimiento,
                        categoria = model.Categoria,
                        registroMoneda = model.RegistroMoneda,
                        monto = model.Monto,
                        mensaje = "Registro guardado"
                    }
                );
            }
            catch (Exception ex)
            {
                // atrapa error y arroja 500
                return StatusCode(500, new
                {
                    mensaje = "Error al procesar solicitud",
                    error = ex.Message
                });
            }

        }
        //ENDPOINT GET
        /// <summary>
        /// Obtiene un registro de IMC por su ID
        /// </summary>
        /// <param name="id">ID del registro a buscar</param>
        /// <returns>Registro de IMC encontrado</returns>
        /// <response code="200">Registro encontrado</response>
        /// <response code="404">Registro no encontrado</response>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]

        public async Task<ActionResult<ModeloBilletera>> ObtenerPorId(int id) // en standby por el momento
        {
            // Buscar el registro en la base de datos
            var registro = await _context.modeloBilleteras.FindAsync(id);

            // Si no existe, devolver 404 Not Found
            if (registro == null)
            {
                return NotFound(new
                {
                    mensaje = $"No se encontró un registro con ID {id}"
                });
            }

            // Si existe, devolver 200 OK con los datos
            return Ok(new
            {
                id = registro.ID_Movimiento,
                categoria = registro.Categoria,
                registroMoneda = registro.RegistroMoneda,
                monto = registro.Monto
            });
        } */


        //
        //VER MOVIMIENTOS DE LA PERSONA
        //
        [HttpGet("usuarios/{idBilletera}/movimientos")]
        public async Task<IActionResult> GetUltimosMovimientos(int idBilletera, [FromQuery] int cantidad = 10)
        {
            var movimientos = await _context.modeloBilleteras
            .Where(m=> m.ID_Billetera == idBilletera)
            .OrderByDescending(f => f.FechaRegistro)
            .Take(cantidad)
            .Select(m => new APIVerMovimientos
            {
                ID_Movimiento = m.ID_Movimiento,
                Categoria = m.Categoria,
                Monto = m.Monto,
                RegistroMoneda = m.RegistroMoneda,
                TipoMovimiento=m.TipoMovimiento,
                RegistroSaldo= m.RegistroSaldo,
                NewRegistroMoneda = m.NewRegistroMoneda,
                FechaRegistro = m.FechaRegistro

            }) .ToListAsync();                   

            return Ok(movimientos);
        }


        //
        //AGREGAR MOVIMIENTO
        //
        [HttpPost("usuarios/{idBilletera}/movimientos")]
        public async Task<IActionResult> AgregarMovimiento(int idBilletera, [FromBody] APIRegistrarMovimientos movimiento)
        {

            try
            {// Verificar que el usuario existe
                var billeteraExiste = await _context.modeloSaldoBilletera.AnyAsync(u => u.ID_Billetera == idBilletera);
                if (!billeteraExiste)
                    return BadRequest("No se encuentran movimientos para su billetera");

                var movimientosCargados = new ModeloBilletera
                {
                    Monto = movimiento.Monto,
                    Categoria = movimiento.Categoria.ToUpper(),
                    RegistroMoneda = movimiento.RegistroMoneda,
                    TipoMovimiento = movimiento.TipoMovimiento,
                    RegistroSaldo = movimiento.RegistroSaldo,
                    NewRegistroMoneda = movimiento.NewRegistroMoneda,
                    FechaRegistro = DateTime.Now,
                    ID_Billetera = idBilletera
                };

                //guardamos
                _context.modeloBilleteras.Add(movimientosCargados);
                await _context.SaveChangesAsync();

                //respuesta 
                return Ok(new
                {
                    id = movimientosCargados.ID_Movimiento,
                    monto = movimientosCargados.Monto,
                    categoria = movimientosCargados.Categoria,
                    RegistroMoneda = movimientosCargados.RegistroMoneda,
                    tipoMovimiento = movimientosCargados.TipoMovimiento,
                    RegistroSaldo = movimientosCargados.RegistroSaldo
                });
            }catch(Exception ex) 
            {
                // MOSTRAR EL ERROR REAL
                string errorCompleto = $"Error: {ex.Message}";

                if (ex.InnerException != null)
                {
                    errorCompleto += $"\nInner Exception: {ex.InnerException.Message}";

                    if (ex.InnerException.InnerException != null)
                    {
                        errorCompleto += $"\nInner Inner: {ex.InnerException.InnerException.Message}";
                    }
                }

                // También imprimir en consola para debugging
                Console.WriteLine("ERROR AL GUARDAR movimiento:");
                Console.WriteLine(errorCompleto);

                return StatusCode(500, new
                {
                    mensaje = "Error al registrar movimiento",
                    error = ex.Message,
                    errorCompleto = errorCompleto  // ← Esto te dará el error real
                });
            }
            

           
        }
    }
}
