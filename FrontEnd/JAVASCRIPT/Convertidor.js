
// Funcion para cargar las monedas
async function obtenerMonedas() {
  const moneda1 = document.getElementById('moneda1');
  const moneda2 = document.getElementById('moneda2');

  const res = await fetch('https://api.frankfurter.dev/v1/latest');
  const datos = await res.json();

  const monedas = Object.keys(datos.rates);
  monedas.unshift(datos.base);

  monedas.forEach(moneda => {
    const option1 = document.createElement('option');
    option1.value = moneda;
    option1.textContent = moneda;

    const option2 = option1.cloneNode(true);

    moneda1.appendChild(option1);
    moneda2.appendChild(option2);
  });
}

// Funcion para convertir automáticamente
async function convertir() {
    let monto = document.getElementById('monto').value;

    // Quitar solo puntos (separadores de miles)
    monto = monto.replace(/\./g, '');

    const from = document.getElementById('moneda1').value;
    const to = document.getElementById('moneda2').value;
    const result = document.getElementById('result');

    if (!monto) {
        result.value = "";
        return;
    }

    if (from === to) {
        result.value = Number(monto).toLocaleString("es-ES");
        return;
    }

    const url = `https://api.frankfurter.dev/v1/latest?amount=${monto}&from=${from}&to=${to}`;
    const res = await fetch(url);
    const datos = await res.json();

    const valor = Object.values(datos.rates)[0];

    result.value = valor.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


//Comas en el input de monto y validacion de numeros
document.getElementById('monto').addEventListener('input', function(e) {
    // Mantener solo números
    let valor = e.target.value.replace(/[^0-9]/g, '');

    // Evitar que falle si está vacío
    if (valor === "") {
        e.target.value = "";
        return;
    }

    // Formatear con puntos cada 3 dígitos
    e.target.value = Number(valor).toLocaleString("es-ES");
});



// Eventos automaticos (sin boton)
document.getElementById('monto').addEventListener('input', convertir);
document.getElementById('moneda1').addEventListener('change', convertir);
document.getElementById('moneda2').addEventListener('change', convertir);

obtenerMonedas();
