
document.getElementById('btnLogin').addEventListener('click', async function(e) {
            e.preventDefault();

                        const correo_user = document.getElementById('email').value;
                        const contraseña_user = document.getElementById('password').value;
                        const infoDiv = document.getElementById('info');

                        //mostrar mensaje de carga
                        infoDiv.innerHTML = '<p>Cargando...</p>';
                        //this.disabled = true; // Deshabilitar el botón para evitar múltiples clics
            try {
                const respuesta = await AuthService.login(correo_user, contraseña_user);

                if (respuesta.success) {
                    infoDiv.innerHTML = `<p>✅ Sesion Iniciada:</p>`;
                    window.location.href = "home.html"; // se puede colocar un delay aqui si se desea
                    localStorage.setItem("isLogged", "True");
                } else {
                    document.getElementById('info').innerHTML = 
                        `<p>❌ Usuario no encontrado</p>`;
                        alert("Usuario no encontrado");
                }
            } catch (error) {
                document.getElementById('info').innerHTML = 
                    `<p>❌ Error inesperado</p>`;
            }

});

       
