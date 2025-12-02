
// CORREO DEL USUARIO NECESARIO PARA VARIOS ENDPOINTS
const id = sessionStorage.getItem("Correo_user"); // esto realmente es el id de billetera
const correo_user = sessionStorage.getItem("correo");

console.log("correo usuario::", correo_user);
console.log(sessionStorage.getItem("Nombre_User"));
console.log(sessionStorage.getItem("Apellido_User"));

function limpiarNumero(str) {
    return parseFloat(str.replace(/\./g, "").replace(/,/g, "."));
}

//////////////////////////////////////////////////
// VER SALDO Y MONEDA ACTUAL
//////////////////////////////////////////////////

const URL_VerSaldo = `https://localhost:7149/api/SaldoBilletera/verSaldo/${correo_user}`;

async function verSaldoDisponible() {
    var divSaldoDisponible = document.getElementById("saldoDisponible");

    try {
        const res = await fetch(URL_VerSaldo, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        console.log(res);
        const datos = await res.json();

        divSaldoDisponible.innerHTML = "$" + datos.saldo_disponible.toFixed(2) + " " + datos.moneda_actual;
    } catch (error) {
        divSaldoDisponible.innerHTML = `<p>Error al cargar Saldo</p>`;
    }
}

verSaldoDisponible();

async function obtenerSaldoActual() {
    const res = await fetch(URL_VerSaldo);
    if (!res.ok) return 0;

    const datos = await res.json();
    return datos.saldo_disponible;
}

async function actualizarSaldo(correoUsuario, monto, tipoMovimiento, moneda) {
    const url = `https://localhost:7149/api/SaldoBilletera/upsert-saldo/${correoUsuario}?tipoMovimiento=${tipoMovimiento}`;

    const body = {
        saldo_disponible: monto,
        moneda_actual: moneda
    };

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        const err = await res.text();
        console.error("Error actualizando saldo:", err);
    }

    return res.json();
}

//////////////////////////////////////////////////
// Obtner moneda
//////////////////////////////////////////////////

async function obtenerMonedas() {
    const btnCambiarMoneda = document.getElementById("btnCambiarMoneda");
    const registroMonedaSelect = document.getElementById("registroMoneda");

    const res = await fetch("https://api.frankfurter.dev/v1/latest");
    const datos = await res.json();

    const monedas = Object.keys(datos.rates);
    monedas.unshift(datos.base);

    monedas.forEach(moneda => {
        // Para el select de cambiar moneda
        const option1 = document.createElement("option");
        option1.value = moneda;
        option1.textContent = moneda;
        btnCambiarMoneda.appendChild(option1);

        // Para el select dentro del modal
        const option2 = document.createElement("option");
        option2.value = moneda;
        option2.textContent = moneda;
        registroMonedaSelect.appendChild(option2);
    });
}
//////////////////////////////////////////////////
// sincronizar 
//////////////////////////////////////////////////

async function sincronizarSelectMoneda() {
    try {
        const res = await fetch(URL_VerSaldo);
        if (!res.ok) return;

        const datos = await res.json();

        const sel = document.getElementById("btnCambiarMoneda");
        if (sel) {
            sel.value = datos.moneda_actual; 
        }
    } catch (error) {
        console.error("Error sincronizando moneda:", error);
    }
}
//////////////////////////////////////////////////
// cambiar moneda
//////////////////////////////////////////////////

async function cambiarMoneda() {
    const monedaNueva = document.getElementById("btnCambiarMoneda").value;

    const res = await fetch(URL_VerSaldo);
    const datos = await res.json();

    const saldoActual = datos.saldo_Disponible ?? datos.saldo_disponible;
    const monedaActual = datos.moneda_Actual ?? datos.moneda_actual;

    if (monedaNueva === monedaActual) return;

    const saldoConvertido = await convertirMoneda(saldoActual, monedaActual, monedaNueva);

    const url = `https://localhost:7149/api/SaldoBilletera/upsert-saldo/${correo_user}?tipoMovimiento=CAMBIO`;

    const body = {
        saldo_Disponible: saldoConvertido,
        moneda_Actual: monedaNueva
    };

    await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    document.getElementById("saldoDisponible").innerHTML =
        `$${saldoConvertido.toFixed(2)} ${monedaNueva}`;

    obtenerMovimientos();
}

document.getElementById("btnCambiarMoneda")
    .addEventListener("change", cambiarMoneda);

async function actualizarMonedaSeleccionada() {
    const monedaNueva = document.getElementById("btnCambiarMoneda").value;

    const res = await fetch(URL_VerSaldo);
    const datos = await res.json();

    const saldoActual = datos.saldo_disponible;
    const monedaActual = datos.moneda_actual;

    if (monedaNueva === monedaActual) return;

    const saldoConvertido = await convertirMoneda(saldoActual, monedaActual, monedaNueva);

    document.getElementById("saldoDisponible").textContent =
        `$${saldoConvertido.toFixed(2)} ${monedaNueva}`;

    await actualizarSaldo(
        correo_user,
        saldoConvertido,
        "CAMBIO",
        monedaNueva
    );

    obtenerMovimientos();
}

document.getElementById("btnCambiarMoneda").addEventListener("change", actualizarMonedaSeleccionada);

async function convertirMoneda(valor, monedaOrigen, monedaDestino) {
    const url = `https://api.frankfurter.app/latest?amount=${valor}&from=${monedaOrigen}&to=${monedaDestino}`;

    const res = await fetch(url);
    const datos = await res.json();

    const claveDestino = Object.keys(datos.rates)[0];
    return datos.rates[claveDestino];
}

///////////////////////////////////////////////////////////////////////
// VER MOVIMIENTOS RECIENTES
///////////////////////////////////////////////////////////////////////

console.log("ID de Billetera:", id);

const URL_Movimientos = `https://localhost:7149/api/Billetera/usuarios/${id}/movimientos?cantidad=10`;
var div = document.getElementById('movimientosRecientes');

function getMonedaActualUI() {
    const sel = document.getElementById("btnCambiarMoneda");
    if (sel && sel.value) return sel.value;

    const saldoTxt = (document.getElementById("saldoDisponible")?.innerText || "").trim();
    const partes = saldoTxt.split(/\s+/);
    return partes.length >= 2 ? partes[partes.length - 1] : "";
}


async function obtenerMovimientos() {
    try {
        const respuesta = await fetch(URL_Movimientos, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!respuesta.ok) {
            div.innerHTML = `<p>❌ Movimiento no encontrado</p>`;
            return;
        }

        let movimientos = await respuesta.json();

        if (!movimientos || movimientos.length === 0) {
            document.getElementById("TituloMovimientosRecientes").innerHTML = "Sin Movimientos Recientes";
            div.innerHTML = "";
            return;
        }

        // ⭐ Tomamos saldo actual
        const saldoTexto = document.getElementById("saldoDisponible").innerText.trim();
        let saldoActual = parseFloat(saldoTexto.replace(/[$A-Za-z ]/g, ""));
        const monedaActualUI = getMonedaActualUI();

        // ⭐ ORDENAR por fecha COMPLETA (fecha + hora)
        movimientos.sort((a, b) =>
            new Date(b.fechaRegistro).getTime() - new Date(a.fechaRegistro).getTime()
        );

        let filas = [];

        movimientos.forEach(mov => {
            const esGasto = (mov.tipoMovimiento || "").toUpperCase() === "GASTO";
            const monto = Number(mov.monto || 0);

            // saldo ANTES de revertir
            let saldoFila = saldoActual;

            // revertimos
            if (esGasto) {
                saldoActual += monto;
            } else {
                saldoActual -= monto;
            }

            const signo = esGasto ? "−" : "+";
            const clase = esGasto ? "monto--gasto" : "monto--ingreso";

            // ⭐ Mostramos solo la FECHA pero ordenamos usando fecha completa
            filas.push(`
                <div class="movim" style="display:grid;
                            grid-template-columns:repeat(5,1fr);
                            gap:10px;
                            font-weight:bold;
                            margin:20px;
                            padding:10px;
                            border-bottom:2px solid #ccc;">
                    <p>${new Date(mov.fechaRegistro).toLocaleDateString()}</p>
                    <p>${mov.categoria}</p>
                    <p class="${clase}">${signo} $${monto.toFixed(2)}</p>
                    <p>${mov.tipoMovimiento}</p>
                    <p style="color:#2c3e50;">$${saldoFila.toFixed(2)} ${monedaActualUI}</p>
                </div>
            `);
        });

        // ⭐ Orden final (antiguo → reciente)
        filas.reverse();
        div.innerHTML = filas.join("");

    } catch (error) {
        console.error(error);
        div.innerHTML = `<p>❌ Error de conexión</p>`;
    }
}




obtenerMovimientos();

///////////////////////////////////////////////////////////////////////
// FORMULARIO MAGICO - APARECE Y DESAPARECE
///////////////////////////////////////////////////////////////////////

const registroGasto = document.getElementById('registroGasto');
const btnAbrir = document.getElementById('btnRegistrarGastos');
const btnCerrar = document.getElementById('cerrarModal');
const formulario = document.getElementById('formularioGasto');

btnAbrir.addEventListener('click', () => {
    registroGasto.style.display = 'block';
});

btnCerrar.addEventListener('click', () => {
    registroGasto.style.display = 'none';
    registroGasto.reset;
});

window.addEventListener('click', (e) => {
    if (e.target == registroGasto) {
        registroGasto.style.display = 'none';
        registroGasto.reset;
    }
});

formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    registroGasto.style.display = 'none';
});

///////////////////////////////////////////////////////////////////////
// CONEXION AL API PARA REGISTRAR GASTO
///////////////////////////////////////////////////////////////////////

const URL_RegistrarGasto =
    `https://localhost:7149/api/Billetera/usuarios/${id}/movimientos`;

document.getElementById('formularioGasto').addEventListener('submit', async function (e) {
    e.preventDefault();

    const datos = {
        categoria: document.getElementById('categoria').value,
        registroMoneda: document.getElementById('registroMoneda').value,
        monto: limpiarNumero(document.getElementById('monto').value),
        tipoMovimiento: document.getElementById('tipoMovimiento').value,
        fechaRegistro: new Date().toISOString() // 🔥 FECHA + HORA EXACTA DESDE JS
    };


    try {
        const respuesta = await fetch(URL_RegistrarGasto, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            const resultado = await respuesta.json();

            await actualizarSaldo(
                correo_user,
                datos.monto,
                datos.tipoMovimiento,
                datos.registroMoneda
            );

            verSaldoDisponible();
            obtenerMovimientos();

            document.getElementById('status').innerHTML = `
                <p>ID: ${resultado.id}</p>
                <p>Monto: ${resultado.monto}</p>
                <p>Categoría: ${resultado.categoria}</p>
                <p>RegistroMoneda: ${resultado.registroMoneda}</p>
                <p>Tipo de Movimiento: ${resultado.tipoMovimiento}</p>
            `;

            document.getElementById('formularioGasto').reset();
        } else {
            const errorText = await respuesta.text();
            document.getElementById('status').innerHTML =
                `<p>❌ Error: ${errorText}</p>`;
        }
    } catch (error) {
        document.getElementById('status').innerHTML =
            `<p>❌ Error de conexión: ${error.message}</p>`;
    }
});

async function iniciarPagina() {
    await obtenerMonedas();            // 1) Llenar selects
    await sincronizarSelectMoneda();   // 2) Seleccionar la moneda correcta del backend
    await verSaldoDisponible();        // 3) Mostrar saldo con moneda correcta
    await obtenerMovimientos();        // 4) Mostrar movimientos con la moneda correcta
}

iniciarPagina()

//menu hamburguesa
const btnHamburger = document.getElementById("btnHamburger");
const mobileMenu = document.getElementById("mobileMenu");

btnHamburger.addEventListener("click", () => {
    if (mobileMenu.style.display === "flex") {
        mobileMenu.style.display = "none";
    } else {
        mobileMenu.style.display = "flex";
    }
});
