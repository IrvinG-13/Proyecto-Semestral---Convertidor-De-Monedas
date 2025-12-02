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

// Añadimos el '?' para evitar errores si el elemento no existe en el DOM
document.getElementById("btnPerfil")?.addEventListener("click", () => {
  ir("Perfil");
});

// Definir 'elisa' de forma segura para evitar ReferenceError
// Intentamos tomar el nombre desde:
// 1) window.elisa (si ya existe por alguna otra parte del código),
// 2) localStorage.user (si guardas ahí un objeto user con name), o
// 3) null si no hay nada.
window.elisa = window.elisa ?? (function(){
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.name ?? null;
    }
  } catch (e) {
    // si falla el parse, ignoramos
  }
  return null;
})();

let nombre = window.elisa;

//Esto es para que te abra a la pagina del login y registro, si no estas logueado
//console.log(localStorage.removeItem("isLogged"))


//Funcion para cerrar sesion
function cerrarSesion() {
  // Si tienes un AuthService definido, úsalo; si no, hacemos un fallback simple
  if (typeof AuthService !== "undefined" && typeof AuthService.logout === "function") {
    AuthService.logout();
  } else {
    // fallback: limpiar estado local y redirigir al login
    localStorage.removeItem("isLogged");
    window.location.href = "../HTML/Login.html";
  }
}



//Pon esto si estas logueado
//localStorage.setItem("isLogged", "True");