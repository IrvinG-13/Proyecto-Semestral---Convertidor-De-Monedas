//Logica del login y registro para la animacion
const contenedor = document.getElementById("contenedor");
const btnIzquierdo = document.getElementById("btnIzquierdo");
const btnDerecho = document.getElementById("btnDerecho");

btnIzquierdo.addEventListener("click", () => {
    contenedor.classList.add("movDerecho");
});

btnDerecho.addEventListener("click", () => {
    contenedor.classList.remove("movDerecho");
});

const close = document.getElementById("Close");

close.addEventListener("click", () => {
    window.location.href = "../HTML/home.html";
});