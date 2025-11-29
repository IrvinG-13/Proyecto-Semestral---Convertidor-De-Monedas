const nombrePerfil = sessionStorage.getItem("Nombre_User");
const apellidoPerfil = sessionStorage.getItem("Apellido_User");
const correoPerfil = sessionStorage.getItem("correo")

const divnombrePerfil= document.getElementById("nombrePerfil");
const divapellidoPerfil = document.getElementById("apellidoPerfil");
const divcorreoPerfil = document.getElementById("correoPerfil");


divnombrePerfil.innerHTML=nombrePerfil;
divapellidoPerfil.innerHTML =apellidoPerfil;
divcorreoPerfil.innerHTML=correoPerfil;
