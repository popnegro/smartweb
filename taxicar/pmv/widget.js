const CONFIG = {
        API_KEY: "AIzaSyAmTzHBhtQ4E8BG6DL0xdrEOYdZmQEBXkI", // ¡RESTRINGE ESTA KEY!
        NUMERO_WA: "5492616706710",
        TARIFAS: { bajada: 1450, ficha: 820, nocturno: 1.2 }, 
        HORA_NOC: { ini: 22, fin: 6 }
    };

    let map, directionsService, directionsRenderer, geocoder, marker, precioActual = 0;

    function initApp() {
        map = new google.maps.Map(document.getElementById("map"), {
            zoom: 15, center: { lat: -32.8895, lng: -68.8458 },
            disableDefaultUI: true, gestureHandling: "greedy"
        });

        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({ map });
        geocoder = new google.maps.Geocoder();
        marker = new google.maps.Marker({ map, animation: google.maps.Animation.DROP });

        const autocompleteOpt = { componentRestrictions: { country: "ar" } };
        const autoO = new google.maps.places.Autocomplete(document.getElementById('origen'), autocompleteOpt);
        const autoD = new google.maps.places.Autocomplete(document.getElementById('destino'), autocompleteOpt);

        autoO.addListener('place_changed', () => {
            const p = autoO.getPlace();
            if (p.geometry) { map.panTo(p.geometry.location); marker.setPosition(p.geometry.location); }
            calcularRuta();
        });
        autoD.addListener('place_changed', calcularRuta);

        document.getElementById('map-spinner').style.opacity = '0';
        setTimeout(() => obtenerGPS(false), 1000);
    }

    function obtenerGPS(manual) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                map.setCenter(c); marker.setPosition(c);
                geocoder.geocode({ location: c }, (res, status) => {
                    if (status === "OK" && res[0]) {
                        document.getElementById('origen').value = res[0].formatted_address;
                    }
                });
            }, null, { enableHighAccuracy: true });
        }
    }

    function calcularRuta() {
        const ori = document.getElementById('origen').value;
        const des = document.getElementById('destino').value;
        if (!ori || !des) return;

        directionsService.route({
            origin: ori, destination: des, travelMode: 'DRIVING'
        }, (res, status) => {
            if (status === 'OK') {
                directionsRenderer.setDirections(res);
                const km = res.routes[0].legs[0].distance.value / 1000;
                const hora = new Date().getHours();
                const m = (hora >= CONFIG.HORA_NOC.ini || hora < CONFIG.HORA_NOC.fin) ? CONFIG.TARIFAS.nocturno : 1;
                const total = Math.round((CONFIG.TARIFAS.bajada * m) + (km * (CONFIG.TARIFAS.ficha * m)));
                document.getElementById('precio-txt').innerText = `$ ${total.toLocaleString('es-AR')}`;
                document.getElementById('btn-pedido').disabled = false;
                precioActual = total;
            }
        });
    }

    function validarYEnviar() {
    const nombre = document.getElementById('user-name').value.trim();
    const ori = document.getElementById('origen').value;
    const des = document.getElementById('destino').value;

    if (nombre.length < 2) { alert("Por favor, ingresa tu nombre"); return; }

    document.getElementById('dispatch-overlay').style.display = 'flex';

    // Generamos el link de Google Maps para el chofer (Navegación directa)
    const mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(ori)}&destination=${encodeURIComponent(des)}&travelmode=driving`;
    
    // Construimos el mensaje para la central
    const msj = `*NUEVO PEDIDO TAXIGO*%0A` +
                `👤 *Pasajero:* ${nombre}%0A` +
                `📍 *Origen:* ${ori}%0A` +
                `🏁 *Destino:* ${des}%0A` +
                `💰 *Estimado:* $${precioActual}%0A%0A` +
                `🗺️ *Ruta:* ${mapUrl}`;

    const waUrl = `https://wa.me/${CONFIG.NUMERO_WA}?text=${msj}`;

    // SALIDA SEGURA DEL IFRAME
    setTimeout(() => {
        const win = window.open(waUrl, '_blank');
        if (win) {
            win.focus();
        } else {
            // Si el navegador bloquea el popup, redireccionamos la ventana actual
            window.location.href = waUrl;
        }
        document.getElementById('dispatch-overlay').style.display = 'none';
    }, 1200);
}

    // Cargar script de Google Maps
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${CONFIG.API_KEY}&libraries=places&callback=initApp`;
    document.head.appendChild(s);