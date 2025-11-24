
document.getElementById('btnCrear').addEventListener('click', async function(e) {
            e.preventDefault();
                        const datos = {
                            nombre_user: document.getElementById('nameCreate').value,
                            apellido_user: document.getElementById('lastnameCreate').value,
                            correo_user: document.getElementById('emailCreate').value,
                            contraseña_user: document.getElementById('passwordCreate').value,
                        };
                         
            try {
                const respuesta = await fetch(`https://localhost:7149/api/Usuario/registro`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',}
                        ,body: JSON.stringify(datos)
                });
                if (respuesta.ok) {
                    const usuario = await respuesta.json();
                    document.getElementById('infoCreate').innerHTML = 
                        `<p>✅ Cuenta Creada:</p>`;
                        
                } else {
                    document.getElementById('infoCreate').innerHTML = 
                        `<p>❌ Cuenta ya existente</p>`;
                }
            } catch (error) {
                document.getElementById('infoCreate').innerHTML = 
                    `<p>❌ Error de conexión</p>`;
            }
});
     