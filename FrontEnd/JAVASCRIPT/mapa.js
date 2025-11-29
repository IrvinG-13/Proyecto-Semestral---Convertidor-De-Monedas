let map;
let placesService;
let markers = [];

function initMap() {
  // Centro inicial genérico (puedes cambiarlo)
  const initialCenter = { lat: 19.4326, lng: -99.1332 }; // Ciudad de México

  map = new google.maps.Map(document.getElementById("map"), {
    center: initialCenter,
    zoom: 6,
  });

  placesService = new google.maps.places.PlacesService(map);

  const input = document.getElementById("search-box");

  // Buscar al presionar Enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = input.value.trim();
      if (query.length > 0) {
        searchPlaces(query);
      }
    }
  });
}

// Limpia markers anteriores
function clearMarkers() {
  markers.forEach((m) => m.setMap(null));
  markers = [];
}

// Realiza la búsqueda tipo "gasolineras ciudad de mexico"
function searchPlaces(query) {
  const request = {
    query: query,
    // Opcional: tipo de lugar genérico, se puede omitir para que Google interprete todo el texto
    // type: 'gas_station', 'supermarket', etc.
  };

  placesService.textSearch(request, (results, status) => {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results) {
      alert("No se encontraron resultados o error en la búsqueda.");
      return;
    }

    clearMarkers();

    const bounds = new google.maps.LatLngBounds();

    results.forEach((place) => {
      if (!place.geometry || !place.geometry.location) return;

      const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
        title: place.name,
      });

      markers.push(marker);
      bounds.extend(place.geometry.location);

      const info = new google.maps.InfoWindow({
        content: `<strong>${place.name}</strong><br>${place.formatted_address || ""}`,
      });

      marker.addListener("click", () => {
        info.open(map, marker);
      });
    });

    // Ajustar el mapa para encuadrar todos los resultados
    map.fitBounds(bounds);
  });
}
