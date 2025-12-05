// photoManager.js - Archivo reutilizable
class ProfileManager {
    // Cargar foto desde API y actualizar UI
    static async loadUserPhoto() {
        const correo = sessionStorage.getItem("correo");
        if (!correo) {
            console.warn("No hay usuario logueado");
            return null;
        }
        
        try {
            const response = await fetch(
                `https://localhost:7149/api/Usuario/getProfilePhoto?correo=${encodeURIComponent(correo)}`
            );
            
            if (!response.ok) {
                console.warn("No se pudo cargar la foto del perfil");
                return null;
            }
            
            const data = await response.json();
            console.log("Datos de la foto recibidos:", data);
            
            if (data.success && data.tieneFoto) {
                // Guardar en sessionStorage
                sessionStorage.setItem("fotoPerfil", data.fotoPerfil);
                console.log("Foto cargada:", data.fotoPerfil);

                // Actualizar UI
                this.updateAllAvatars(data.fotoPerfil);
                return data.fotoPerfil;
            } else {
                // Usar avatar por defecto
                this.updateAllAvatars(null);
                return null;
            }
            
        } catch (error) {
            console.error("Error cargando foto:", error);
            return null;
        }
    }
    
    // Actualizar todos los avatares en la página
    static updateAllAvatars(fotoPath) {
        const defaultAvatar = '/FrontEnd/Assets/Avatars/default-avatar.png';
        const avatarUrl = fotoPath || defaultAvatar;
        
        // 1. Avatar grande (página de perfil)
        const avatarGrande = document.getElementById('circulo-avatar');
        if (avatarGrande) {
            avatarGrande.innerHTML = `
                <img src="${avatarUrl}" alt="Foto perfil" 
                     style="width: 150px; height: 150px; border-radius: 50%; object-fit: cover;">
            `;
        }
        
        // 2. Avatar pequeño (navbar)
        const avatarNavbar = document.getElementById('avatar-navbar');
        if (avatarNavbar) {
            avatarNavbar.src = avatarUrl;
        }
        
        // 3. Avatar sidebar
        const avatarSidebar = document.getElementById('avatar-sidebar');
        if (avatarSidebar) {
            avatarSidebar.src = avatarUrl;
        }
        
        // 4. Cualquier otro avatar con clase 'user-avatar'
        document.querySelectorAll('.user-avatar').forEach(avatar => {
            avatar.src = avatarUrl;
        });
    }
    
    // Guardar nueva foto (después de PUT exitoso)
    static saveNewPhoto(fotoPath) {
        sessionStorage.setItem("fotoPerfil", fotoPath || "");
        this.updateAllAvatars(fotoPath);
    }
    
    // Obtener foto actual (de sessionStorage o API)
    static async getCurrentPhoto() {
        // Primero intentar de sessionStorage
        let foto = sessionStorage.getItem("fotoPerfil");
        console.log("Foto en sessionStorage:", foto);
        
        // Si no hay o es "null" string, cargar de API
        if (!foto || foto === "null") {
            foto = await this.loadUserPhoto();
        }
        
        return foto;
    }
}