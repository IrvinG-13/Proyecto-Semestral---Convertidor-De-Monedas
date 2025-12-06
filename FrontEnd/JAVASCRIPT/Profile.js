// Profile.js - AGREGAR ESTO AL PRINCIPIO DEL ARCHIVO
console.log("🎯 ======= PROFILE.JS INICIANDO =======");
console.log("Archivo cargado desde:", window.location.href);

const nombrePerfil = sessionStorage.getItem("Nombre_User");
const apellidoPerfil = sessionStorage.getItem("Apellido_User");
const correoPerfil = sessionStorage.getItem("correo")

const divnombrePerfil1= document.getElementById("nombrePerfil1");
const divnombrePerfil2= document.getElementById("nombrePerfil2");
const divapellidoPerfil = document.getElementById("apellidoPerfil");
const divcorreoPerfil = document.getElementById("correoPerfil");

console.log(nombrePerfil);
console.log(correoPerfil);



divnombrePerfil1.value=nombrePerfil+" "+apellidoPerfil;
divnombrePerfil2.value=nombrePerfil+" "+apellidoPerfil;
//divapellidoPerfil.value =apellidoPerfil;
divcorreoPerfil.value=correoPerfil;



// Lógica para cambiar la foto de perfil
// Lista de imágenes en tu carpeta assets
const assetsImages = [
    '/FrontEnd/Assets/Avatars/Avatar1.png',
    '/FrontEnd/Assets/Avatars/Avatar2.png',
    '/FrontEnd/Assets/Avatars/Avatar3.png',
    
];


// Mostrar galería de assets
document.getElementById('upload-btn').addEventListener('click', function() {
    console.log("Elemento upload-btn:", document.getElementById('upload-btn'));

    const gallery = document.getElementById('assets-gallery');
    gallery.style.display = gallery.style.display === 'none' ? 'block' : 'none';
    
    if (gallery.style.display === 'block') {
        loadAssetsImages();
    }
});

// Cargar imágenes desde assets
function loadAssetsImages() {
    const imageGrid = document.querySelector('.image-grid');
    imageGrid.innerHTML = '';
    
    assetsImages.forEach(imagePath => {
        const imgElement = document.createElement('div');
        imgElement.className = 'image-item';
        imgElement.innerHTML = `
            <img src="${imagePath}" alt="Imagen" 
                 onclick="selectImage('${imagePath}')">
        `;
        imageGrid.appendChild(imgElement);
    });
}

// Seleccionar imagen
function selectImage(imagePath) {
    // Guardar la ruta temporalmente
    window.selectedImagePath = imagePath;
    
    // Mostrar vista previa
    const preview = document.getElementById('circulo-avatar');
    preview.innerHTML = `
        <img src="${imagePath}" alt="Vista previa" style="max-width: 200px;">
    `;
    
    // Ocultar galería
    document.getElementById('assets-gallery').style.display = 'none';
    
    saveToDatabase();
}

// Guardar en base de datos
async function saveToDatabase() {
    const imagePath = window.selectedImagePath;
   
    
    try {
        const response = await fetch(`https://localhost:7149/api/Usuario/updateProfile?correo=${encodeURIComponent(correoPerfil)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ perfil_User: imagePath })
        });
        
        const result = await response.json();
        if (result.success) {
            alert('Imagen guardada correctamente');
        }
    } catch (error) {
        console.error('Error:', error);
    }
    // Ejemplos de uso:
// 1. Para subir imagen: actualizarFotoPerfil("juan@email.com", "/FrontEnd/assets/images/mifoto.jpg")
// 2. Para eliminar: actualizarFotoPerfil("juan@email.com", "")
// 3. Para eliminar: actualizarFotoPerfil("juan@email.com", null)

//Cargar foto al iniciar
}
  ProfileManager.loadUserPhoto();
