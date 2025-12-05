// ============================================================================
// VARIABLES GLOBALES Y CONFIGURACIÓN
// ============================================================================

// Obtener datos del usuario desde sessionStorage
const id = sessionStorage.getItem("Correo_user"); // ID de billetera (aunque se llama Correo_user)
const correo_user = sessionStorage.getItem("correo"); // Correo real del usuario

// URLs de los endpoints API
const URL_VerSaldo = `https://localhost:7149/api/SaldoBilletera/verSaldo/${correo_user}`;
const URL_Movimientos = `https://localhost:7149/api/Billetera/usuarios/${id}/movimientos?cantidad=10`;
const URL_RegistrarGasto = `https://localhost:7149/api/Billetera/usuarios/${id}/movimientos`;

// Referencias a elementos del DOM
const divMovimientos = document.getElementById('movimientosRecientes');
const registroGasto = document.getElementById('registroGasto');
const btnAbrir = document.getElementById('btnRegistrarGastos');
const btnCerrar = document.getElementById('cerrarModal');
const formulario = document.getElementById('formularioGasto');

// ============================================================================
// FUNCIONES UTILITARIAS
// ============================================================================

/**
 * Convierte un string con formato de número (con puntos y comas) a un número decimal
 * Ejemplo: "1.234,56" → 1234.56
 */
function limpiarNumero(str) {
  if (!str) return 0;
  return parseFloat(
    str.trim().replace(",", ".")  // solo convierte coma a punto
  ) || 0;
}




// ============================================================================
// FUNCIONES DE SALDO
// ============================================================================

/**
 * Muestra el saldo disponible del usuario en la interfaz
 */
async function verSaldoDisponible() {
    const divSaldoDisponible = document.getElementById("saldoDisponible");

    try {
        const res = await fetch(URL_VerSaldo, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        const datos = await res.json();
        divSaldoDisponible.innerHTML = "$" + datos.saldo_disponible.toFixed(2) + " " + datos.moneda_actual;
    } catch (error) {
        divSaldoDisponible.innerHTML = `<p>Error al cargar Saldo</p>`;
    }
}

/**
 * Obtiene el saldo actual y la moneda del usuario
 * Retorna un objeto {saldo, moneda}
 */
async function obtenerSaldoActual() {
    try {
        const res = await fetch(URL_VerSaldo);
        if (!res.ok) return { saldo: 0, moneda: "USD" };

        const datos = await res.json();
        return {
            saldo: datos.saldo_disponible || 0,
            moneda: datos.moneda_actual || "USD"
        };
    } catch (error) {
        console.error("Error obteniendo saldo y moneda actual:", error);
        return { saldo: 0, moneda: "USD" };
    }
}

/**
 * Actualiza el saldo del usuario en el backend
 * IMPORTANTE: El backend espera el MONTO a sumar/restar, no el saldo total
 * 
 * @param {string} correoUsuario - Correo del usuario
 * @param {number} montoParaBackend - Monto que el backend sumará o restará
 * @param {string} tipoMovimiento - "GASTO" o "INGRESO"
 * @param {string} moneda - Moneda del movimiento
 */
async function actualizarSaldo(correoUsuario, montoParaBackend, tipoMovimiento, moneda) {
    const url = `https://localhost:7149/api/SaldoBilletera/upsert-saldo/${correoUsuario}?tipoMovimiento=${tipoMovimiento}`; //INGRESO o GASTO

    const body = {
        saldo_disponible: montoParaBackend, // Este es el MONTO a sumar/restar, NO el saldo total
        moneda_actual: moneda
    };

    console.log(`Enviando al backend para ${tipoMovimiento}: ${montoParaBackend} ${moneda}`);

    const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("Error actualizando saldo:", err);
    }

    return res.json();
}

// ============================================================================
// FUNCIONES DE CONVERSIÓN DE MONEDA
// ============================================================================

/**
 * Convierte un monto de una moneda a otra usando la API Frankfurter
 * 
 * @param {number} valor - Monto a convertir
 * @param {string} monedaOrigen - Código de moneda origen (ej: "USD")
 * @param {string} monedaDestino - Código de moneda destino (ej: "EUR")
 * @returns {Promise<number>} - Monto convertido
 */
async function convertirMoneda(valor, monedaOrigen, monedaDestino) {
    const url = `https://api.frankfurter.app/latest?amount=${valor}&from=${monedaOrigen}&to=${monedaDestino}`;
    const res = await fetch(url);
    const datos = await res.json();

    const claveDestino = Object.keys(datos.rates)[0];
    return datos.rates[claveDestino];
}

/**
 * Obtiene la lista de monedas disponibles desde la API Frankfurter
 * y las carga en los selectores correspondientes
 */

async function obtenerMonedas() {
    const btnCambiarMoneda = document.getElementById("btnCambiarMoneda");
    const registroMonedaSelect = document.getElementById("registroMoneda");

    const res = await fetch("https://api.frankfurter.dev/v1/latest");
    const datos = await res.json();

    // Obtener todas las monedas disponibles
    const monedas = Object.keys(datos.rates);
    monedas.unshift(datos.base); // Agregar la moneda base al inicio

    // Cargar monedas en ambos selectores
    monedas.forEach(moneda => {
        const option1 = document.createElement("option");
        option1.value = moneda;
        option1.textContent = moneda;
        btnCambiarMoneda.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = moneda;
        option2.textContent = moneda;
        registroMonedaSelect.appendChild(option2);
    });
}

/**
 * Cambia la moneda actual del usuario
 * Convierte el saldo a la nueva moneda y actualiza en el backend
 */
async function actualizarMonedaSeleccionada() {
    const monedaNueva = document.getElementById("btnCambiarMoneda").value;

    const res = await fetch(URL_VerSaldo);
    const datos = await res.json();

    const saldoActual = datos.saldo_disponible;
    const monedaActual = datos.moneda_actual;

    // No hacer nada si la moneda es la misma
    if (monedaNueva === monedaActual) return;

    // Convertir saldo a la nueva moneda
    const saldoConvertido = await convertirMoneda(saldoActual, monedaActual, monedaNueva);

    // Actualizar interfaz
    document.getElementById("saldoDisponible").textContent = 
        `$${saldoConvertido.toFixed(2)} ${monedaNueva}`;

    // Actualizar en backend (tipo "CAMBIO" especial)
    await actualizarSaldo(correo_user, saldoConvertido, "CAMBIO", monedaNueva);

    // Actualizar lista de movimientos
    obtenerMovimientos();
}

// ============================================================================
// FUNCIONES DE MOVIMIENTOS
// ============================================================================

/**
 * Obtiene y muestra los últimos movimientos del usuario
 */
async function obtenerMovimientos() {
    try {
        const filtro = document.getElementById("filtroMovimientos").value;
        console.log("Filtro seleccionado:", filtro);
        const URL_Movimientos = `https://localhost:7149/api/Billetera/usuarios/${id}/movimientos?cantidad=${filtro}`;
        const respuesta = await fetch(URL_Movimientos, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!respuesta.ok) {
            divMovimientos.innerHTML = `<p>Error: Movimiento no encontrado</p>`;
            return;
        }

        let movimientos = await respuesta.json();
        const { saldo: saldoActual, moneda: monedaActual } = await obtenerSaldoActual();
        console.log("Moneda actual para mostrar movimientos:", monedaActual);

        if (!movimientos || movimientos.length === 0) {
            document.getElementById("TituloMovimientosRecientes").innerHTML = "Sin Movimientos Recientes";
            divMovimientos.innerHTML = "";
            return;
        }

        let html = '';
        
        // Generar HTML para cada movimiento
        movimientos.forEach(mov => {
            const esGasto = (mov.tipoMovimiento || "").toUpperCase() === "GASTO";
            const signo = esGasto ? "−" : "+";
            const clase = esGasto ? "monto--gasto" : "monto--ingreso";

            html += `
                <div class="movim" style="display:grid;
                            grid-template-columns:repeat(5,1fr);
                            gap:10px;
                            font-weight:bold;
                            margin:20px;
                            padding:10px;
                            border-bottom:2px solid #ccc;">
                    <p>${new Date(mov.fechaRegistro).toLocaleDateString()}</p>
                    <p>${mov.categoria}</p> 
                    <p class="${clase}">${signo} $${mov.monto.toFixed(2)} ${mov.registroMoneda}</p>
                    <p>${mov.tipoMovimiento}</p>
                    <p style="color:#2c3e50;">$${mov.registroSaldo.toFixed(2)} ${mov.newRegistroMoneda} </p>
                </div>
            `;
        });
        
        divMovimientos.innerHTML = html;

    } catch (error) {
        console.error(error);
        divMovimientos.innerHTML = `<p>Error de conexión</p>`;
    }
}

/**
 * Calcula el monto que debe enviarse al backend
 * El backend hace: saldoActual ± montoRecibido = nuevoSaldo
 * Por lo tanto: montoRecibido = |nuevoSaldo - saldoActual|
 * 
 * @param {number} saldoActual - Saldo actual del usuario
 * @param {number} nuevoSaldoTotal - Saldo después del movimiento
 * @param {string} tipoMovimiento - "GASTO" o "INGRESO"
 * @returns {number} - Monto a enviar al backend
 */
function calcularMontoParaBackend(saldoActual, nuevoSaldoTotal, tipoMovimiento) {
    if (tipoMovimiento.toUpperCase() === "GASTO") {
        // Backend hace: saldoActual - monto = nuevoSaldo
        // Entonces: monto = saldoActual - nuevoSaldo
        return saldoActual - nuevoSaldoTotal;
    } else {
        // Backend hace: saldoActual + monto = nuevoSaldo
        // Entonces: monto = nuevoSaldo - saldoActual
        return nuevoSaldoTotal - saldoActual;
    }
}

// ============================================================================
// MANEJO DEL FORMULARIO
// ============================================================================

/**
 * Maneja el envío del formulario de registro de movimiento
 */
document.getElementById('formularioGasto').addEventListener('submit', async function (e) {
    e.preventDefault();

    // 1. Obtener datos del formulario
    const categoria = document.getElementById('categoria').value;
    const registroMoneda = document.getElementById('registroMoneda').value;
    const montoOriginal = limpiarNumero(document.getElementById('monto').value);
    const tipoMovimiento = document.getElementById('tipoMovimiento').value;

    // 2. Obtener saldo actual del usuario
    const { saldo: saldoActual, moneda: monedaActual } = await obtenerSaldoActual();
    
    console.log(`Saldo actual: ${saldoActual} ${monedaActual}`);
    console.log(`Movimiento: ${montoOriginal} ${registroMoneda} (${tipoMovimiento})`);

    // 3. Convertir monto si es necesario
    let montoEnMonedaActual = montoOriginal;
    if (registroMoneda !== monedaActual) {
        montoEnMonedaActual = await convertirMoneda(montoOriginal, registroMoneda, monedaActual);
        console.log(`Convertido: ${montoOriginal} ${registroMoneda} = ${montoEnMonedaActual} ${monedaActual}`);
    }

    // 4. Calcular nuevo saldo total (solo para mostrar en UI y guardar en movimiento)
    let nuevoSaldoTotal;
    if (tipoMovimiento.toUpperCase() === "GASTO") {
        nuevoSaldoTotal = saldoActual - montoEnMonedaActual;
    } else {
        nuevoSaldoTotal = saldoActual + montoEnMonedaActual;
    }
    
    console.log(`Nuevo saldo total: ${nuevoSaldoTotal} ${monedaActual}`);

    // 5. Calcular qué monto enviar al backend
    // IMPORTANTE: El backend espera el MONTO a sumar/restar, no el saldo total
    const montoParaBackend = calcularMontoParaBackend(saldoActual, nuevoSaldoTotal, tipoMovimiento);
    
    console.log(`Enviando al backend: ${montoParaBackend} ${monedaActual}`);
    console.log(`(Backend hará: ${saldoActual} ${tipoMovimiento === "GASTO" ? "-" : "+"} ${montoParaBackend} = ${nuevoSaldoTotal})`);

    // 6. Preparar datos para guardar el movimiento
    const datosMovimiento = {
        categoria: categoria,
        registroMoneda: registroMoneda, // Moneda original del movimiento
        monto: montoOriginal, // Monto original (sin convertir)
        tipoMovimiento: tipoMovimiento,
        registroSaldo: nuevoSaldoTotal, // Saldo después del movimiento (para historial)
        newRegistroMoneda: monedaActual, // Moneda actual del usuario
        fechaRegistro: new Date().toISOString() 
    };

    try {
        // 7. Guardar el movimiento en el historial
        const respuesta = await fetch(URL_RegistrarGasto, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosMovimiento)
        });

        if (respuesta.ok) {
            const resultado = await respuesta.json();

            // 8. Actualizar el saldo (enviando el MONTO correcto al backend)
            await actualizarSaldo(
                correo_user,
                montoParaBackend, // ← MONTO a sumar/restar, NO el saldo total
                tipoMovimiento,
                monedaActual
            );

            // 9. Actualizar interfaz
            verSaldoDisponible();
            obtenerMovimientos();

            // 10. Mostrar confirmación al usuario
            document.getElementById('status').innerHTML = `
                <div style="background:#e8f5e9; padding:15px; border-radius:5px;">
                    <p style="color:#2e7d32; font-weight:bold;">Movimiento registrado exitosamente</p>
                    <p>Monto: ${montoOriginal.toFixed(2)} ${registroMoneda}</p>
                    ${registroMoneda !== monedaActual ? 
                    `<p>Convertido: ${montoEnMonedaActual.toFixed(2)} ${monedaActual}</p>` : ''}
                    <p>Nuevo saldo: ${nuevoSaldoTotal.toFixed(2)} ${monedaActual}</p>
                </div>
            `;

            // 11. Limpiar formulario
            document.getElementById('formularioGasto').reset();
        } else {
            const errorText = await respuesta.text();
            document.getElementById('status').innerHTML = 
                `<p style="color:red;">Error: ${errorText}</p>`;
        }
    } catch (error) {
        document.getElementById('status').innerHTML = 
            `<p style="color:red;">Error de conexión: ${error.message}</p>`;
    }
});

// ============================================================================
// MANEJO DEL MODAL (FORMULARIO EMERGENTE)
// ============================================================================

// Mostrar modal al hacer clic en el botón
btnAbrir.addEventListener('click', () => {
    registroGasto.style.display = 'block';
});

// Ocultar modal al hacer clic en el botón cerrar
btnCerrar.addEventListener('click', () => {
    registroGasto.style.display = 'none';
    formulario.reset();
});

// Ocultar modal al hacer clic fuera del formulario
window.addEventListener('click', (e) => {
    if (e.target == registroGasto) {
        registroGasto.style.display = 'none';
        formulario.reset();
    }
});

// Prevenir envío del formulario y ocultar modal
formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    registroGasto.style.display = 'none';
});

// ============================================================================
// EVENT LISTENERS Y CONFIGURACIÓN INICIAL
// ============================================================================

// Configurar evento para cambiar moneda
document.getElementById("btnCambiarMoneda").addEventListener("change", actualizarMonedaSeleccionada);

/**
 * Inicializa la página cargando todos los datos necesarios
 */
async function iniciarPagina() {
    try {
        await obtenerMonedas();     // Cargar lista de monedas
        await verSaldoDisponible(); // Mostrar saldo actual
        await obtenerMovimientos(); // Cargar movimientos recientes
        console.log("Página inicializada correctamente");
    } catch (error) {
        console.error("Error inicializando la página:", error);
    }
}


/////////////////////////////
/// FUNCION DESCARGAR PDF ///
///////////////////////////

async function descargarPDF() {
    try {
        // 1. Obtener el ID_Billetera del usuario
        // Depende de cómo lo tengas almacenado
        const idBilletera = id; // Usando la variable global 'id' definida al inicio    
        
        if (!idBilletera) {
            alert("No se encontró el ID de billetera");
            return;
        }
        
        // 2. Mostrar mensaje de carga
        const boton = document.getElementById('btnDescargarPDF');
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = "Generando PDF...";
        boton.disabled = true;
        
        // 3. URL del endpoint - AJUSTA el nombre del controlador
        // Si tu controlador se llama "SaldoBilleteraController":
        const url = `https://localhost:7149/api/Billetera/pdf-syncfusion-fixed/${idBilletera}?correo=${correo_user}`;
        
        console.log("Descargando PDF desde:", url);
        
        // 4. Opción A: Abrir en nueva pestaña (más simple)
        window.open(url, '_blank');
        
        // 5. Restaurar botón
        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error("Error descargando PDF:", error);
        alert("Error al generar PDF: " + error.message);
        
        // Restaurar botón
        const boton = document.getElementById('btnDescargarPDF');
        if (boton) {
            boton.innerHTML = "📄 Descargar Reporte PDF";
            boton.disabled = false;
        }
    }
}

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

// Llamadas iniciales (ya existentes en el código)
verSaldoDisponible();
obtenerMovimientos();

// Inicializar página completa cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarPagina);
} else {
    iniciarPagina();
}

        const btnHamburger = document.getElementById("btnHamburger");
        const mobileMenu = document.getElementById("mobileMenu");

        btnHamburger.addEventListener("click", () => {
            if (mobileMenu.style.display === "flex") {
                mobileMenu.style.display = "none";
            } else {
                mobileMenu.style.display = "flex";
            }
        });




