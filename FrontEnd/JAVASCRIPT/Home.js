//Cmabiar entre paginas
const verStatusLogin = localStorage.getItem("isLogged");
console.log("Login status on Home.js:", verStatusLogin); // esto es para ver si estoy logueado


function ir(page) {
  const logged = localStorage.getItem("isLogged");
  console.log("Logged status:", logged);


  if (page === "Perfil" && !logged) {
    window.location.href = "../HTML/Login.html";
    return;
  }

  window.location.href = `../HTML/${page}.html`;

}

document.getElementById("btnPerfil").addEventListener("click", () => {
  ir("Perfil");
});
let nombre = elisa
//Esto es para que te abra a la pgian del login y registro, si no etas logueado
//console.log(localStorage.removeItem("isLogged"))


//Funcion para cerrar sesion
function cerrarSesion() {
  AuthService.logout();
}



//Pon esto si estas logueado
//localStorage.setItem("isLogged", "True");
