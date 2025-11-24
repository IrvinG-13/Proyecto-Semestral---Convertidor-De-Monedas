            
            //////////////////////////////////////////////////
            //   BOTON CAMBIAR MONEDA
            /////////////////////////////////////////////////////

            async function obtenerMonedas() {
                const btnCambiarMoneda = document.getElementById("btnCambiarMoneda");

                const res = await fetch("https://api.frankfurter.dev/v1/latest");
                const datos = await res.json();

                const monedas = Object.keys(datos.rates); // se traen el nombre de monedas con .rates
                monedas.unshift(datos.base); // se habilita la seleccion de las monedas traidas del API

                monedas.forEach(moneda =>{
                    const option1 = document.createElement("option");
                    
                    option1.value = moneda;
                    option1.textContent= moneda;

                    btnCambiarMoneda.appendChild(option1);

                });

            }


            
            ///////////////////////////////////////////////////////////////////////
            //   VER MOVIMIENTOS RECIENTES 
            ///////////////////////////////////////////////////////////////////////
            const id = sessionStorage.getItem("Correo_user");
            console.log("Correo del usuario:", id);
            const URL = `https://localhost:7149/api/Billetera/usuarios/${id}/movimientos?cantidad=10`;
            var div = document.getElementById('movimientosRecientes');

             async function obtenerMovimientos() {
            
            
            try {
                const respuesta = await fetch(URL, {
                    method: 'GET',
                    headers: {'Content-Type': 'application/json'
                    }
                    });
                
                if (respuesta.ok) {
                    

                    const movimiento = await respuesta.json();
                    console.log("Movimientos en total:", movimiento.length);

 
                    let htmlContent = '';  // ← Acumulador de HTML

                    // Una vez se conecta con el API Verifica si no hay movimientos
                    if(movimiento.length === 0){

                        console.log("No hay movimientos");
                        document.getElementById("TituloMovimientosRecientes").innerHTML="Sin Movimientos Recientes";

                    } else {
                                console.log("Si hay movimientos");
                                movimiento.forEach(mov => {
                        htmlContent += `
                        <div style="border: 1px solid #ccc; margin: 10px; padding: 10px; border-radius: 5px;">
                            <p><strong>Monto:</strong> $${mov.monto}</p>
                            <p><strong>Categoría:</strong> ${mov.categoria}</p>
                            <p><strong>Tipo:</strong> ${mov.tipoMovimiento}</p>
                            <p><strong>Fecha:</strong> ${new Date(mov.fechaRegistro).toLocaleDateString()}</p>
                        </div>`;
                    });

                    //  Asigna el HTML acumulado al elemento
                    div.innerHTML = htmlContent;
                    }

                } else {
                    div.innerHTML = 
                        `<p>❌ Movimiento no encontrado</p>`;
                }
            } catch (error) {
                div.innerHTML = 
                    `<p>❌ Error de conexión</p>`;
            }
        };

        obtenerMovimientos();



 ///////////////////////////////////////////////////////////////////////
 //   FORMULARIO MAGICO - APARECE Y DESAPARECE 
///////////////////////////////////////////////////////////////////////
  // Elementos
  const registroGasto = document.getElementById('registroGasto');
  const btnAbrir = document.getElementById('btnRegistrarGastos');
  const btnCerrar = document.getElementById('cerrarModal');
  const formulario = document.getElementById('formularioGasto');

  // Abrir form
  btnAbrir.addEventListener('click', () => {
    registroGasto.style.display = 'block';
  });

  // Cerrar form
  btnCerrar.addEventListener('click', () => {
    registroGasto.style.display = 'none';
    registroGasto.reset
  });

  // Cerrar form si se da clic fuera del contenido
  window.addEventListener('click', (e) => {
    if (e.target == registroGasto) {
      registroGasto.style.display = 'none';
      registroGasto.reset

    }
  });

  // Manejar submit del formulario
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    //alert('Formulario enviado: ' + formulario.monto.value + ', ' + formulario.categoria.value);
    registroGasto.style.display = 'none'; // Cerrar modal después de enviar
  });


   ///////////////////////////////////////////////////////////////////////
 //   CONEXION AL API PARA REGISTRAR GASTO
///////////////////////////////////////////////////////////////////////
const URL_RegistrarGasto = `https://localhost:7149/api/Billetera/usuarios/${id}/movimientos`
document.getElementById('formularioGasto').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const datos = {
                categoria: document.getElementById('categoria').value,
                registroMoneda: document.getElementById('registroMoneda').value,
                monto: parseFloat(document.getElementById('monto').value),
                tipoMovimiento: document.getElementById('tipoMovimiento').value
            };
            
            try {
                // Cambia esta URL por la de tu API
                const respuesta = await fetch(URL_RegistrarGasto, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(datos)
                });
                
                if (respuesta.ok) {
                    const resultado = await respuesta.json();
                    document.getElementById('status').innerHTML = 
                        `<p>ID: ${resultado.id}</p>
                        <p>Monto: ${resultado.monto}</p>
                         <p>Categoría: ${resultado.categoria}</p>
                         <p>RegistroMoneda: ${resultado.registroMoneda}</p>
                         <p>Tipo de Movimiento: ${resultado.tipoMovimiento}</p>`;
                         obtenerMovimientos(); // actualiza la lista de movimientos
                    
                    // Limpiar formulario
                    document.getElementById('formularioGasto').reset();
                } else {
                    const error = await respuesta.json();
                    document.getElementById('status').innerHTML = 
                        `<p>❌ Error: ${error.mensaje}</p>`;
                }
            } catch (error) {
                document.getElementById('status').innerHTML = 
                    `<p>❌ Error de conexión: ${error.message}</p>`;
            }
        });

obtenerMonedas() 