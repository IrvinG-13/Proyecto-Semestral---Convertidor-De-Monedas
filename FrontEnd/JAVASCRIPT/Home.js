//Cmabiar entre paginas
function ir(page) {
  const logged = localStorage.getItem("isLogged");

  if (page === "Perfil" && !logged) {
    window.location.href = "../HTML/Login.html";
    return;
  }

  window.location.href = `../HTML/${page}.html`;

}

document.getElementById("btnPerfil").addEventListener("click", () => {
  ir("Perfil");
});

//Esto es para que te abra a la pgian del login y registro, si no etas logueado
console.log(localStorage.removeItem("isLogged"))



//Pon esto si estas logueado
//localStorage.setItem("isLogged", "True");
