// Variables globales que necesitamos
let map;                    // El mapa de Google
let placesService;          // Servicio para buscar lugares
let markers = [];           // Para guardar todos los marcadores del mapa
let userMarker = null;      // Marcador de la ubicación del usuario
let userPosition = null;    // Posición actual del usuario (latitud, longitud)

// Esta función se ejecuta cuando la página carga
// Inicializa el mapa y configura todo
function initMap() {
    // Creamos el mapa centrado en una posición inicial
    const center = { lat: 8.5380, lng: -80.7821 };  // Centro en Panamá
    map = new google.maps.Map(document.getElementById("map"), {
        center: center,
        zoom: 7  // Nivel de zoom inicial
    });

    // Inicializamos el servicio para buscar lugares
    placesService = new google.maps.places.PlacesService(map);

    // Configuramos la barra de búsqueda
    setupSearchBox();

    // Configuramos los botones
    setupButtons();

    // Permitimos que el usuario haga clic en el mapa para marcar su ubicación
    setupMapClicks();
}

// Configura la barra de búsqueda para buscar con la tecla Enter
function setupSearchBox() {
    const searchBox = document.getElementById("search-box");
    
    searchBox.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            const searchText = searchBox.value.trim();
            if (searchText) {
                searchPlaces(searchText);
            }
        }
    });
}

// Configura los botones del mapa
function setupButtons() {
    // Botón para usar la ubicación actual
    const locateBtn = document.getElementById("locateBtn");
    locateBtn.addEventListener("click", getUserLocation);

    // Botón para buscar casas de cambio cercanas
    const exchangesBtn = document.getElementById("searchExchangesBtn");
    exchangesBtn.addEventListener("click", function() {
        if (userPosition) {
            searchNearbyExchanges();
        } else {
            alert("Primero establece tu ubicación usando el botón 'Usar mi ubicación'");
        }
    });
}

// Configura que al hacer clic en el mapa se marque esa ubicación
function setupMapClicks() {
    map.addListener("click", function(event) {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        setUserPosition(lat, lng);
    });
}

// Obtiene la ubicación actual del usuario usando el GPS del navegador
function getUserLocation() {
    // Verificamos si el navegador soporta geolocalización
    if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización");
        return;
    }

    // Pedimos la ubicación al navegador
    navigator.geolocation.getCurrentPosition(
        function(position) {
            // Si obtenemos la ubicación exitosamente
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setUserPosition(lat, lng);
        },
        function() {
            // Si hay un error o el usuario no da permiso
            alert("No se pudo obtener tu ubicación. Asegúrate de dar permiso.");
        }
    );
}

// Establece la posición del usuario en el mapa
function setUserPosition(lat, lng) {
    userPosition = { lat: lat, lng: lng };

    // Si ya había un marcador del usuario, lo removemos
    if (userMarker) {
        userMarker.setMap(null);
    }

    // Creamos un nuevo marcador para el usuario
    userMarker = new google.maps.Marker({
        position: userPosition,
        map: map,
        title: "Tu ubicación",
        // Usamos un icono especial para diferenciarlo
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",  // Azul de Google
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2
        }
    });

    // Movemos el mapa para centrarlo en la nueva posición
    map.panTo(userPosition);
    map.setZoom(14);  // Zoom más cercano
}

// Busca lugares usando texto (como "restaurantes" o "hospitales")
function searchPlaces(searchText) {
    const request = {
        query: searchText  // El texto que el usuario escribió
    };

    placesService.textSearch(request, function(results, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
            alert("No se encontraron resultados");
            return;
        }

        clearMarkers();  // Limpiamos marcadores anteriores
        const bounds = new google.maps.LatLngBounds();  // Para ajustar el zoom

        // Creamos un marcador para cada resultado
        results.forEach(function(place) {
            if (!place.geometry || !place.geometry.location) return;

            const marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location,
                title: place.name
            });

            markers.push(marker);  // Guardamos el marcador
            bounds.extend(place.geometry.location);  // Expandimos el área visible

            // Mostramos información cuando se hace clic en el marcador
            marker.addListener("click", function() {
                const infoWindow = new google.maps.InfoWindow({
                    content: `<strong>${place.name}</strong><br>${place.formatted_address || ""}`
                });
                infoWindow.open(map, marker);
            });
        });

        // Ajustamos el mapa para mostrar todos los resultados
        map.fitBounds(bounds);
    });
}

// Busca casas de cambio y bancos cerca de la ubicación del usuario
function searchNearbyExchanges() {
    if (!userPosition) return;

    clearMarkers();  // Limpiamos marcadores anteriores

    const center = new google.maps.LatLng(userPosition.lat, userPosition.lng);
    const seenPlaces = {};  // Para no mostrar lugares duplicados
    const resultsList = [];  // Para guardar todos los resultados

    // Función que procesa los resultados de la búsqueda
    function processResults(results, status) {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return;

        results.forEach(function(place) {
            // Si ya vimos este lugar, lo saltamos
            if (seenPlaces[place.place_id]) return;
            seenPlaces[place.place_id] = true;
            resultsList.push(place);

            // Creamos un marcador para este lugar
            createExchangeMarker(place);
        });
    }

    // Primera búsqueda: lugares con "currency exchange"
    placesService.nearbySearch({
        location: center,
        radius: 3000,  // Busca en un radio de 3km
        keyword: "currency exchange"
    }, processResults);

    // Segunda búsqueda: bancos
    placesService.nearbySearch({
        location: center,
        radius: 3000,
        type: "bank"
    }, processResults);
}

// Crea un marcador para una casa de cambio o banco
function createExchangeMarker(place) {
    if (!place.geometry || !place.geometry.location) return;

    const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        title: place.name
    });

    markers.push(marker);  // Guardamos el marcador

    // Cuando se hace clic en el marcador, mostramos detalles
    marker.addListener("click", function() {
        const content = `
            <div style="padding: 10px;">
                <strong>${place.name}</strong><br>
                ${place.vicinity || ""}<br>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${place.geometry.location.lat()},${place.geometry.location.lng()}" 
                   target="_blank" style="color: blue;">
                    Cómo llegar
                </a>
            </div>
        `;

        const infoWindow = new google.maps.InfoWindow({ content: content });
        infoWindow.open(map, marker);
    });
}

// Limpia todos los marcadores del mapa (excepto el del usuario)
function clearMarkers() {
    markers.forEach(function(marker) {
        marker.setMap(null);  // Remueve el marcador del mapa
    });
    markers = [];  // Vaciamos el array
}