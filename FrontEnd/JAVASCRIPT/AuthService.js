class AuthService {
    static async login(correo_user, contraseña_user) {
        try {
            const respuesta = await fetch(`https://localhost:7149/api/Usuario/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({correo_user, contraseña_user})
            });

            if (respuesta.ok) {
                const usuario = await respuesta.json();
                console.log(usuario)
                
                // 🔥 MANTENER tu código que ya funciona
                sessionStorage.setItem("Correo_user", usuario.iD_Billetera.toString());
                sessionStorage.setItem("correo",usuario.correo_User.toString() );
                sessionStorage.setItem("Nombre_User", usuario.nombre_User.toString());
                sessionStorage.setItem("Apellido_User", usuario.apellido_User.toString());
                localStorage.setItem("isLogged", "True");
                
                return { success: true, user: usuario };
            } else {
                return { success: false, error: 'Usuario no encontrado' };
            }
        } catch (error) {
            return { success: false, error: 'Error de conexión' };
        }
    }

    static logout() {
        // 🔥 LIMPIAR exactamente lo que guardas
        sessionStorage.removeItem("Correo_user");
        localStorage.removeItem("isLogged");
        window.location.href = "login.html";
    }

    static isAuthenticated() {
        // 🔥 Verificar con TUS datos
        return localStorage.getItem("isLogged") === "True" && 
               sessionStorage.getItem("Correo_user") !== null;
    }

    static getCurrentUser() {
        return sessionStorage.getItem("Correo_user");
    }
}