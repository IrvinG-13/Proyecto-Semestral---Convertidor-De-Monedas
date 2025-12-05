using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Services;
using ProjectMoneyExchange.Data;
using ProjectMoneyExchange.Models;
using ProjectMoneyExchange.Models.ModelosAPIS;
using System.ComponentModel.DataAnnotations;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace ProjectMoneyExchange.Controllers
{
    [Route("api/[controller]")]
    [EnableCors("AllowAll")]
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
                    Apellido_User = usuario.Apellido_User,
                    ID_Billetera = billetera.ID_Billetera // aqui le mandamos el IDBilletera al iniciar sesion

                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensaje = "error en el servidor", error = ex.Message });
            }
        }

        [HttpPut("updateProfile")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult> UpdateProfile(
        [FromBody] APIActualizarPerfil request,
        [FromQuery] string correo)
        {
            try
            {
                // 1. Validación básica
                if (string.IsNullOrWhiteSpace(correo))
                {
                    return BadRequest(new { mensaje = "El correo es requerido" });
                }

                // 2. Buscar usuario
                var usuario = await _context.modeloUsuarios
                    .FirstOrDefaultAsync(u => u.Correo_User == correo.Trim().ToLower());

                if (usuario == null)
                {
                    return Unauthorized(new { mensaje = "Usuario no encontrado" });
                }

                // 3. Manejar solo la imagen de perfil
                // Si viene null o vacío, eliminamos la foto
                usuario.Perfil_User = string.IsNullOrWhiteSpace(request.Perfil_User)
                    ? null
                    : request.Perfil_User.Trim();

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    mensaje = string.IsNullOrWhiteSpace(request.Perfil_User)
                        ? "Foto de perfil eliminada"
                        : "Foto de perfil actualizada",
                    fotoPerfil = usuario.Perfil_User
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error interno del servidor",
                    error = ex.Message
                });
            }
        }

        //Endpoint para Obtener foto de perfil
        [HttpGet("getProfilePhoto")]
        public async Task<ActionResult> GetProfilePhoto([FromQuery] string correo)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(correo))
                {
                    return BadRequest(new { mensaje = "El correo es requerido" });
                }

                var usuario = await _context.modeloUsuarios
                    .FirstOrDefaultAsync(u => u.Correo_User == correo.Trim().ToLower());

                if (usuario == null)
                {
                    return NotFound(new { mensaje = "Usuario no encontrado" });
                }

                return Ok(new
                {
                    success = true,
                    fotoPerfil = usuario.Perfil_User, // Puede ser null
                    tieneFoto = !string.IsNullOrEmpty(usuario.Perfil_User)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    mensaje = "Error al obtener foto",
                    error = ex.Message
                });
            }
        }


    }
}
