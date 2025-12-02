// mapa.js - versión extendida partiendo de tu archivo original
// Conservé tu estructura y comentarios originales y añadí mejoras optativas:
// - Autolocalización (si el usuario lo permite)
// - Selector de país y centrado (si existen los elementos en el DOM)
// - Búsqueda de "casas de cambio" / bancos cercanos (NearbySearch)
// - Direcciones (DirectionsService + DirectionsRenderer) con botón "Cómo llegar"
// - Mantengo la búsqueda por texto que ya tenías (placesService.textSearch al presionar Enter)
// Nota: este archivo asume que la Google Maps JS API con Places y callback=initMap se carga en el HTML.

let map;
let placesService;
let markers = [];

// Nuevas variables para rutas y estado del usuario
let directionsService;
let directionsRenderer;
let infoWindow;
let currentPosition = null; // {lat, lng}

// Función original: inicializa el mapa y el manejo del input
function initMap() {
  // Centro inicial genérico (puedes cambiarlo)
  const initialCenter = { lat: 19.4326, lng: -99.1332 }; // Ciudad de México

  map = new google.maps.Map(document.getElementById("map"), {
    center: initialCenter,
    zoom: 6,
  });

  placesService = new google.maps.places.PlacesService(map);

  // Inicializar servicios adicionales
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: false });
  directionsRenderer.setMap(map);

  infoWindow = new google.maps.InfoWindow();

  const input = document.getElementById("search-box");

  // Buscar al presionar Enter (mantengo tu comportamiento original)
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = input.value.trim();
      if (query.length > 0) {
        searchPlaces(query);
      }
    }
  });

  // Si existen botones en el HTML, los conectamos (no obligatorios)
  // Botón de "Usar mi ubicación"
  const locateBtn = document.getElementById('locateBtn');
  if (locateBtn) {
    locateBtn.addEventListener('click', () => {
      tryAutoLocate((ok) => {
        if (!ok) alert("No se pudo obtener tu ubicación. Usa el selector de país o haz clic en el mapa.");
      });
    });
  }

  // Botón de "Buscar casas de cambio cercanas"
  const searchExBtn = document.getElementById('searchExchangesBtn');
  if (searchExBtn) {
    searchExBtn.addEventListener('click', () => {
      if (!currentPosition) {
        alert('Primero establece tu ubicación (usar mi ubicación, centrar país o clic en el mapa).');
        return;
      }
      searchNearbyExchanges(currentPosition.lat, currentPosition.lng);
    });
  }

  // Selector de país (si existe)
  const centerCountryBtn = document.getElementById('centerCountryBtn');
  if (centerCountryBtn) {
    centerCountryBtn.addEventListener('click', () => {
      const countrySelect = document.getElementById('countrySelect');
      if (!countrySelect) return;
      const code = countrySelect.value;
      // Mapa puede no tener la lista; definimos centros básicos aquí (si quieres, mueve la lista a otro lugar)
      const countryCenters = {
        "PA": { lat: 8.5380, lng: -80.7821, zoom: 7 }, // Panamá
        "CR": { lat: 9.7489, lng: -83.7534, zoom: 6 },
        "CO": { lat: 4.5709, lng: -74.2973, zoom: 5 },
        "NI": { lat: 12.8654, lng: -85.2072, zoom: 6 },
        "HN": { lat: 15.1990, lng: -86.2419, zoom: 6 },
        "SV": { lat: 13.7942, lng: -88.8965, zoom: 7 },
        "GT": { lat: 15.7835, lng: -90.2308, zoom: 6 }
      };
      const c = countryCenters[code];
      if (!c) return alert('Selecciona un país válido.');
      map.setCenter({ lat: c.lat, lng: c.lng });
      map.setZoom(c.zoom);
      // colocamos un marcador en el centro del país (ayuda al usuario)
      setUserLocation(c.lat, c.lng, c.zoom);
    });
  }

  // click en mapa para elegir ubicación 
  map.addListener('click', (e) => {
    const lat = e.latLng.lat(), lng = e.latLng.lng();
    setUserLocation(lat, lng, map.getZoom() < 13 ? 15 : map.getZoom());
  });

  // Intentar autolocalizar (al cargar)
  tryAutoLocate((ok) => {
    if (ok) {
      // si se pudo localizar, no forzamos nada más; el usuario puede buscar o usar el botón de buscar.
      // opcional: podríamos llamar searchNearbyExchanges(currentPosition.lat, currentPosition.lng);
    } else {
      // no localizó; el mapa queda en el centro inicial
    }
  });
}

// Limpia markers anteriores
function clearMarkers() {
  markers.forEach((m) => m.setMap(null));
  markers = [];
}

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

      // InfoWindow con contenido y opción de "Cómo llegar" si existe currentPosition
      const info = new google.maps.InfoWindow({
        content: `<strong>${place.name}</strong><br>${place.formatted_address || ""}` +
                 (currentPosition ? `<br><button class="dir-btn" data-lat="${place.geometry.location.lat()}" data-lng="${place.geometry.location.lng()}">Cómo llegar</button>` : "")
      });

      marker.addListener("click", () => {
        info.open(map, marker);

        // si añadimos el botón "Cómo llegar", lo enlazamos dinámicamente
        if (currentPosition) {
          // Esperamos un tick para que el DOM del InfoWindow esté listo
          setTimeout(() => {
            const btn = document.querySelector('.dir-btn[data-lat][data-lng]');
            if (btn) {
              btn.addEventListener('click', () => {
                const toLat = parseFloat(btn.getAttribute('data-lat'));
                const toLng = parseFloat(btn.getAttribute('data-lng'));
                drawRoute(currentPosition, { lat: toLat, lng: toLng });
              }, { once: true });
            }
          }, 100);
        }
      });
    });

    // Ajustar el mapa para encuadrar todos los resultados
    map.fitBounds(bounds);
  });
}

/* --------------- FUNCIONES NUEVAS RELACIONADAS A RUTAS Y BÚSQUEDAS DE CASAS DE CAMBIO --------------- */

// Establece la ubicación "seleccionada" del usuario (puede provenir de geolocalización, clic o selector de país)
function setUserLocation(lat, lng, zoom = 14) {
  currentPosition = { lat, lng };
  // Elimina marcador anterior de usuario si existe
  // (reutilizo un marcador con el icono de círculo)
  if (window.userMarkerGlobal) {
    window.userMarkerGlobal.setMap(null);
  }
  window.userMarkerGlobal = new google.maps.Marker({
    position: { lat, lng },
    map,
    title: 'Ubicación seleccionada',
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 7,
      fillColor: '#2E7D32',
      fillOpacity: 1,
      strokeColor: '#ffffff',
      strokeWeight: 2
    }
  });
  map.panTo({ lat, lng });
  map.setZoom(zoom);
  // Limpiamos ruta anterior al posicionar usuario
  clearRoute();
}

// Intento de geolocalización; callback recibe true/false según éxito
function tryAutoLocate(callback) {
  if (!navigator.geolocation) {
    console.warn('Geolocalización no disponible.');
    callback(false);
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      setUserLocation(pos.coords.latitude, pos.coords.longitude, 15);
      callback(true);
    },
    (err) => {
      console.warn('Geolocalización falló o fue denegada:', err?.message ?? err);
      callback(false);
    },
    { enableHighAccuracy: true, timeout: 7000 }
  );
}

// Buscar casas de cambio y bancos cercanos usando Places NearbySearch
function searchNearbyExchanges(lat, lng) {
  clearMarkers();
  clearRoute();
  const center = new google.maps.LatLng(lat, lng);
  const found = {};
  const resultsList = [];

  // helper que procesa los resultados de nearbySearch
  function handleResults(results, status) {
    if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return;
    results.forEach(place => {
      if (!found[place.place_id]) {
        found[place.place_id] = true;
        resultsList.push(place);
        // crear marcador con popup que ofrece "Cómo llegar"
        createExchangeMarker(place);
      }
    });
    renderResultsList(resultsList);
  }

  // Buscamos por keyword 'currency exchange' y por type 'bank' (dos llamadas)
  placesService.nearbySearch({ location: center, radius: 3000, keyword: 'currency exchange' }, (res, status) => handleResults(res, status));
  placesService.nearbySearch({ location: center, radius: 3000, type: 'bank' }, (res, status) => handleResults(res, status));
}

// crear marcador para casa de cambio / banco
function createExchangeMarker(place) {
  if (!place.geometry || !place.geometry.location) return;
  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    title: place.name
  });
  markers.push(marker);

  marker.addListener('click', () => {
    // pedimos detalles para más info (teléfono, website) si se desea
    const request = { placeId: place.place_id, fields: ['name','formatted_address','formatted_phone_number','website','geometry'] };
    placesService.getDetails(request, (details, status) => {
      const name = details?.name ?? place.name;
      const addr = details?.formatted_address ?? place.vicinity ?? '';
      const destLat = place.geometry.location.lat();
      const destLng = place.geometry.location.lng();
      let content = `<div><strong>${name}</strong><br/>${addr}<br/>`;
      if (details?.formatted_phone_number) content += `Tel: ${details.formatted_phone_number}<br/>`;
      if (details?.website) content += `<a href="${details.website}" target="_blank">Sitio web</a><br/>`;
      content += `<a href="https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}" target="_blank">Abrir en Google Maps</a><br/>`;
      content += `<button id="dirBtnEx" style="margin-top:6px;">Cómo llegar aquí</button>`;
      content += `</div>`;

      infoWindow.setContent(content);
      infoWindow.open(map, marker);

      google.maps.event.addListenerOnce(infoWindow, 'domready', () => {
        const btn = document.getElementById('dirBtnEx');
        if (btn) {
          btn.addEventListener('click', () => {
            if (!currentPosition) {
              alert('No se ha detectado tu ubicación de origen. Selecciona tu ubicación primero.');
              return;
            }
            drawRoute(currentPosition, { lat: destLat, lng: destLng });
          });
        }
      });
    });
  });
}

// Render simple de lista de resultados en el contenedor #results (si existe)
function renderResultsList(list) {
  const resultsDiv = document.getElementById('results');
  if (!resultsDiv) return;
  resultsDiv.innerHTML = '';
  const ul = document.createElement('ul');
  ul.style.listStyle = 'none';
  ul.style.padding = '0';
  list.forEach(place => {
    const li = document.createElement('li');
    li.style.padding = '8px';
    li.style.borderBottom = '1px solid #eee';
    li.style.cursor = 'pointer';
    li.textContent = place.name + (place.vicinity ? ' - ' + place.vicinity : '');
    li.addEventListener('click', () => {
      if (place.geometry && place.geometry.location) {
        map.panTo(place.geometry.location);
        map.setZoom(17);
      }
    });
    ul.appendChild(li);
  });
  resultsDiv.appendChild(ul);
}

// Dibuja la ruta usando DirectionsService y muestra distancia/duración en #status
function drawRoute(from, to) {
  if (!directionsService || !directionsRenderer) return alert('Servicio de direcciones no inicializado.');
  const req = {
    origin: new google.maps.LatLng(from.lat, from.lng),
    destination: new google.maps.LatLng(to.lat, to.lng),
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: false
  };
  directionsService.route(req, (res, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(res);
      try {
        const leg = res.routes[0].legs[0];
        const statusEl = document.getElementById('status');
        if (statusEl) statusEl.textContent = `Distancia: ${leg.distance.text} — Duración: ${leg.duration.text}`;
      } catch (e) { /* ignore */ }
    } else {
      alert('No se pudo calcular la ruta: ' + status);
    }
  });
}

// Limpia la ruta mostrada
function clearRoute() {
  if (directionsRenderer) directionsRenderer.set('directions', null);
}