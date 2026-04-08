/**
 * TaxiGo / MiTaxi Mendoza - Core Script
 * Versión: 4.0 - Marcador de Pulso & Centrado Dinámico
 */

const app = {
    config: {
        tel: "5492616706710",
        key: "AIzaSyAmTzHBhtQ4" + "E8BG6DL0xdrEOYdZmQEBXkI", 
        bounds: { north: -32.70, south: -33.15, west: -69.05, east: -68.65 },
        tarifas: { bajada: 2200, km: 1100, nocturno: 1.20 }
    },
    map: null, 
    pulseMarker: null, 
    directions: { svc: null, rnd: null }, 
    geocoder: null,

    async init() {
        // 1. Importar Librerías necesarias de Google Maps v3.55+
        const { Map, InfoWindow } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        // 2. Inicializar Mapa
        this.map = new Map(document.getElementById("map"), {
            zoom: 15, 
            center: { lat: -32.8895, lng: -68.8458 },
            mapId: "DEMO_MAP_ID", // Requerido para Advanced Markers
            disableDefaultUI: true,
            gestureHandling: 'greedy', 
            styles: [
                { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] }
            ]
        });

        this.directions.svc = new google.maps.DirectionsService();
        this.directions.rnd = new google.maps.DirectionsRenderer({ 
            map: this.map, 
            suppressMarkers: false,
            polylineOptions: { strokeColor: "#7233ff", strokeWeight: 6, strokeOpacity: 0.8 } 
        });
        
        this.geocoder = new google.maps.Geocoder();
        
        // 3. Crear el Marcador de Pulso (Origen)
        const pulseTag = document.createElement('div');
        pulseTag.className = 'pulse-marker'; // Definido en el CSS de widget.html
        
        this.pulseMarker = new AdvancedMarkerElement({
            map: this.map,
            content: pulseTag,
            title: "Tu ubicación"
        });

        // 4. Autocompletado (Mendoza)
        const acOpt = { 
            bounds: this.config.bounds, 
            componentRestrictions: { country: "ar" }, 
            strictBounds: true,
            fields: ["formatted_address", "geometry"] 
        };
        
        const autoO = new google.maps.places.Autocomplete(document.getElementById('origen'), acOpt);
        const autoD = new google.maps.places.Autocomplete(document.getElementById('destino'), acOpt);

        // Listener de Origen: Centrado Inmediato
        autoO.addListener('place_changed', () => {
            const place = autoO.getPlace();
            if (place.geometry && place.geometry.location) {
                this.map.panTo(place.geometry.location);
                this.map.setZoom(17);
                this.pulseMarker.position = place.geometry.location;
            }
            this.calc(); 
            this.toggleGpsBtn(); 
        });

        autoD.addListener('place_changed', () => this.calc());
        
        // Listeners de UI
        document.getElementById('nombre').addEventListener('input', (e) => {
            this.updateGreeting(e.target.value);
            this.validateForm();
        });

        document.getElementById('origen').addEventListener('input', () => {
            this.toggleGpsBtn();
            this.validateForm();
        });

        const savedName = localStorage.getItem('taxigo_user');
        if (savedName) {
            document.getElementById('nombre').value = savedName;
            this.updateGreeting(savedName);
        }

        this.checkInitialLocation();
    },

    updateGreeting(name) {
        const saludoEl = document.getElementById('txt-saludo');
        if (!saludoEl) return;
        const cleanName = name.trim();
        saludoEl.innerText = cleanName ? (cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase()) : "hoy";
    },

    toggleGpsBtn() {
        const val = document.getElementById('origen').value.trim();
        const btn = document.getElementById('btn-gps');
        if (btn) btn.style.display = (val === "") ? "block" : "none";
    },

    checkInitialLocation() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => this.handleGpsSuccess(pos),
            null, { timeout: 5000, enableHighAccuracy: true }
        );
    },

    handleGpsSuccess(pos) {
        const coord = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        
        // Centrado suave en el GPS
        this.map.panTo(coord);
        this.map.setZoom(17);
        this.pulseMarker.position = coord;

        this.geocoder.geocode({ location: coord }, (res, status) => {
            if (status === 'OK' && res[0]) { 
                document.getElementById('origen').value = res[0].formatted_address; 
                this.toggleGpsBtn();
                this.calc(); 
            }
        });
    },

    refreshGPS() {
        const btn = document.getElementById('btn-gps');
        if (btn) btn.style.opacity = "0.4";
        navigator.geolocation.getCurrentPosition(
            (pos) => { this.handleGpsSuccess(pos); if(btn) btn.style.opacity = "1"; },
            () => { alert("Por favor, activa el GPS."); if(btn) btn.style.opacity = "1"; }
        );
    },

    calc() {
        const o = document.getElementById('origen').value;
        const d = document.getElementById('destino').value;
        if (!o || !d) return;

        // Ocultar el pulso cuando ya hay una ruta trazada (opcional)
        // this.pulseMarker.map = null;

        this.directions.svc.route({ 
            origin: o, 
            destination: d, 
            travelMode: 'DRIVING' 
        }, (res, status) => {
            if (status === 'OK') {
                this.directions.rnd.setDirections(res);
                
                // Centrado inteligente Origen + Destino
                const bounds = new google.maps.LatLngBounds();
                const route = res.routes[0].legs[0];
                bounds.extend(route.start_location);
                bounds.extend(route.end_location);
                
                this.map.fitBounds(bounds, {
                    top: 50, bottom: 280, left: 50, right: 50
                });

                const dist = route.distance.value / 1000;
                const h = new Date().getHours();
                let total = Math.round(this.config.tarifas.bajada + (dist * this.config.tarifas.km));
                
                const nightEl = document.getElementById('night-msg');
                if (h >= 22 || h < 6) { 
                    total = Math.round(total * this.config.tarifas.nocturno);
                    if(nightEl) nightEl.classList.remove('d-none');
                } else {
                    if(nightEl) nightEl.classList.add('d-none');
                }
                
                document.getElementById('txt-precio').innerText = `$ ${total.toLocaleString('es-AR')}`;
                this.validateForm();
            }
        });
    },

    validateForm() {
        const n = document.getElementById('nombre').value.trim();
        const o = document.getElementById('origen').value.trim();
        const d = document.getElementById('destino').value.trim();
        const p = document.getElementById('txt-precio').innerText;
        const btn = document.getElementById('btn-main');
        if (btn) btn.disabled = !(n.length >= 3 && o.length > 5 && d.length > 5 && p !== "$ 0");
    },

    async startProcess() {
        const nombre = document.getElementById('nombre').value.trim();
        const origen = document.getElementById('origen').value;
        const destino = document.getElementById('destino').value;
        const precio = document.getElementById('txt-precio').innerText;

        localStorage.setItem('taxigo_user', nombre);

        window.parent.postMessage({
            type: 'TAXI_ORDER_CLICK',
            data: { nombre, destino, precio }
        }, '*');

        const overlay = document.getElementById('overlay');
        if (overlay) overlay.style.display = 'flex';

        const msg = `*PEDIDO MITAXI*\n👤 *Pasajero:* ${nombre}\n📍 *Desde:* ${origen}\n🏁 *Hacia:* ${destino}\n💰 *Estimado:* ${precio}`;
        const url = `https://api.whatsapp.com/send?phone=${this.config.tel}&text=${encodeURIComponent(msg)}`;

        setTimeout(() => {
            window.parent.location.href = url;
        }, 150); 
    }
};

// Carga asíncrona de la API con librerías modernas
(function loadGoogleMaps() {
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${app.config.key}&libraries=places&callback=initApp`;
    s.async = true; s.defer = true;
    document.head.appendChild(s);
})();

window.initApp = () => app.init();