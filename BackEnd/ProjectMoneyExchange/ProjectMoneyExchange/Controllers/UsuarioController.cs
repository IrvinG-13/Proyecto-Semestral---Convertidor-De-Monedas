using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Services;
using ProjectMoneyExchange.Data;
using ProjectMoneyExchange.Models;
using ProjectMoneyExchange.Models.ModelosAPIS;

namespace ProjectMoneyExchange.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsuarioController : ControllerBase
    {

        private readonly AplicacionDbContext _context;

        public UsuarioController(AplicacionDbContext context)
        { 
            _context = context;
        }

        [HttpPost("registro")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> Registro([FromBody] APIRegistroRequest request)
        {
            //Validaciones
            if (string.IsNullOrWhiteSpace(request.Nombre_User))
            {
                return BadRequest(new { mensaje = "El nombre es requerido" });
            }

            if (string.IsNullOrWhiteSpace(request.Apellido_User))
            {
                return BadRequest(new { mensaje = "el apellido es requerido" });
            }

            if (string.IsNullOrWhiteSpace(request.Correo_User))
            {
                return BadRequest(new { mensaje = "El email es requerido" });
            }

            if (string.IsNullOrWhiteSpace(request.Contraseña_User) || request.Contraseña_User.Length < 4)
            {
                return BadRequest(new { mensaje = "La contraseña debe tener al menos 4 caracteres" });

            }

            try 
            {
                //validar que el email ya no esté registrado
                if (await _context.modeloUsuarios.AnyAsync(u => u.Correo_User == request.Correo_User)) // modeloUsuarios viene del DbContext
                {
                    return BadRequest(new { mensaje = "El email ya está registrado" });
                }

                // Crear usuario
                var usuario = new ModeloUsuario
                {
                    Nombre_User = request.Nombre_User.Trim(),
                    Apellido_User = request.Apellido_User.Trim(),
                    Correo_User = request.Correo_User.Trim().ToLower(),
                    Contraseña_User = request.Contraseña_User.Trim()
                };

                _context.modeloUsuarios.Add(usuario);

                //Creacion de billetera automaticamente al registrarse
                var billetera = new ModeloSaldoBilletera
                {
                    Correo_User = request.Correo_User,
                    Saldo_Disponible = 0, // Saldo inicial
                    MonedaActual = "USD" // Moneda por defecto
                };
                _context.modeloSaldoBilletera.Add(billetera);

                await _context.SaveChangesAsync();


                return Ok(new APILoginResponse
                {
                    Mensaje = "Usuario registrado exitosamente",
                    Correo_User = usuario.Correo_User,
                    Nombre_User = usuario.Nombre_User,                    
                }) ;

                return Ok(new ModeloSaldoBilletera { ID_Billetera = billetera.ID_Billetera });

            } catch (Exception ex) 
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
                Console.WriteLine("ERROR AL GUARDAR USUARIO:");
                Console.WriteLine(errorCompleto);

                return StatusCode(500, new
                {
                    mensaje = "Error al registrar usuario",
                    error = ex.Message,
                    errorCompleto = errorCompleto  // ← Esto te dará el error real
                });
            }

        }


        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult> Login([FromBody] APILoginRequest request)
        {

            if (string.IsNullOrWhiteSpace(request.Correo_User) || string.IsNullOrWhiteSpace(request.Contraseña_User))
            {
                return BadRequest(new { mensaje = "Correo y contraseña son requeridos" });
            }

            try
            {
                //buscar usuario por email
                var usuario = await _context.modeloUsuarios.FirstOrDefaultAsync(u => u.Correo_User == request.Correo_User.Trim().ToLower());

                //verificacion
                if (usuario == null || usuario.Contraseña_User != request.Contraseña_User)
                {
                    return Unauthorized(new { mensaje = "email o contraseña incorrectos" });
                }

                //buscar la billetera asociada al usuario
                var billetera = await _context.modeloSaldoBilletera
                .FirstOrDefaultAsync(b => b.Correo_User == usuario.Correo_User);
                // Si no existe billetera, crear una (por seguridad) aunque ya se crean al registrar usuario
                if (billetera == null)
                {
                    billetera = new ModeloSaldoBilletera
                    {
                        Correo_User = usuario.Correo_User,
                        Saldo_Disponible = 0,
                        MonedaActual = "USD"
                    };
                    _context.modeloSaldoBilletera.Add(billetera);
                    await _context.SaveChangesAsync();
                }

                return Ok(new APILoginResponse
                {
                    Mensaje = "login exitoso",
                    Correo_User = usuario.Correo_User,
                    Nombre_User = usuario.Nombre_User,
                    ID_Billetera = billetera.ID_Billetera // aqui le mandamos el IDBilletera al iniciar sesion

                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "error en el servidor", error = ex.Message });
            }
        }


    }
}
