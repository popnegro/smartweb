// 1. Inicialización y Variables Globales
lucide.createIcons();

let map = null;
let polyline = null;
let userData = { start: null, end: null, price: 0 };
const MZA_BOUNDS = "-69.0436,-33.1092,-68.6416,-32.7483";

// Cargar nombre guardado al inicio
window.addEventListener('DOMContentLoaded', () => {
    const savedName = localStorage.getItem('taxigo_name');
    if (savedName) {
        const nameInput = document.getElementById('userName');
        if (nameInput) nameInput.value = savedName;
    }
});

// 2. Geolocalización
async function getLocation() {
    const btn = document.querySelector('button[onclick="getLocation()"]');
    if (!navigator.geolocation) return alert("Geolocalización no soportada");

    btn.classList.add('animate-pulse');
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        userData.start = [latitude, longitude];
        
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            // Priorizamos nombre de calle o barrio
            const address = data.address.road || data.address.suburb || data.address.amenity || "Ubicación detectada";
            document.getElementById('origin').value = address;
        } catch (err) {
            document.getElementById('origin').value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        } finally {
            btn.classList.remove('animate-pulse');
        }
    }, () => {
        btn.classList.remove('animate-pulse');
        alert("Por favor, activa el GPS para localizarte.");
    });
}

// 3. Búsqueda con Debounce (Evita saturar la API)
let searchTimeout;
async function searchMendoza(query) {
    const results = document.getElementById('results');
    clearTimeout(searchTimeout);

    if (query.length < 3) {
        results.classList.add('hidden');
        return;
    }

    searchTimeout = setTimeout(async () => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + " Mendoza")}&viewbox=${MZA_BOUNDS}&bounded=1&countrycodes=ar&limit=4`);
            const data = await res.json();
            
            results.innerHTML = '';
            if (data.length === 0) {
                results.classList.add('hidden');
                return;
            }

            results.classList.remove('hidden');
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = "p-4 hover:bg-yellow-50 cursor-pointer transition-colors text-xs font-bold border-b border-slate-50 last:border-0";
                const parts = item.display_name.split(',');
                
                div.innerHTML = `
                    <div class="text-slate-900">${parts[0]}</div>
                    <div class="text-[10px] opacity-40 uppercase">${parts.slice(1, 3).join(',')}</div>
                `;
                
                div.onclick = () => {
                    document.getElementById('destination').value = parts[0];
                    userData.end = [parseFloat(item.lat), parseFloat(item.lon)];
                    results.classList.add('hidden');
                };
                results.appendChild(div);
            });
        } catch (err) {
            console.error("Error en búsqueda:", err);
        }
    }, 300); // 300ms de espera tras dejar de escribir
}

// 4. Lógica de Navegación
function toStep2() {
    const name = document.getElementById('userName').value.trim();
    const origin = document.getElementById('origin').value.trim();
    
    if (!name || !userData.end || !origin) {
        return alert("Por favor, completa tu nombre, recogida y elige un destino de la lista.");
    }
    
    localStorage.setItem('taxigo_name', name);
    
    // Simulación de tarifa base Mendoza 2026
    userData.price = Math.floor(Math.random() * (4200 - 2100) + 2100);
    document.getElementById('display-price').innerText = `$${userData.price}`;
    
    changeStep(2);
    // Timeout para que el contenedor del mapa exista antes de renderizar
    setTimeout(initMap, 500);
}

function initMap() {
    const startPos = userData.start || [-32.8895, -68.8458];
    
    if (map) map.remove();
    
    map = L.map('map', { zoomControl: false, attributionControl: false }).setView(startPos, 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    
    L.marker(startPos).addTo(map);
    L.marker(userData.end).addTo(map);
    
    polyline = L.polyline([startPos, userData.end], {
        color: '#000', 
        weight: 5, 
        dashArray: '10, 10',
        opacity: 0.5
    }).addTo(map);
    
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
}

function changeStep(s) {
    [1, 2, 3].forEach(n => {
        const step = document.getElementById(`step-${n}`);
        if (step) step.classList.toggle('step-hidden', n !== s);
    });
    
    // Actualizar Puntos (Dots)
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, i) => {
        if (i === (s - 1)) {
            dot.classList.replace('w-1.5', 'w-6');
            dot.classList.replace('bg-black/20', 'bg-black');
        } else {
            dot.classList.replace('w-6', 'w-1.5');
            dot.classList.replace('bg-black', 'bg-black/20');
        }
    });

    const header = document.getElementById('widget-header');
    header.className = (s === 3) ? "bg-green-500 p-8 transition-all duration-500" : "bg-yellow-400 p-8 transition-all duration-500";
    
    lucide.createIcons();
}

function sendToWhatsApp() {
    const name = localStorage.getItem('taxigo_name');
    const msg = `🚕 *NUEVO PEDIDO TAXIGO*\n👤 *Pasajero:* ${name}\n📍 *Desde:* ${document.getElementById('origin').value}\n🏁 *Hacia:* ${document.getElementById('destination').value}\n💰 *Estimado:* $${userData.price}`;
    window.open(`https://wa.me/5492610000000?text=${encodeURIComponent(msg)}`, '_blank');
    changeStep(3);
}

function resetWidget() {
    userData.end = null;
    document.getElementById('destination').value = '';
    changeStep(1);
}

// 5. Google Auth & Tabs
function handleCredentialResponse(response) {
    const data = JSON.parse(window.atob(response.credential.split('.')[1]));
    document.getElementById('user-profile').classList.remove('hidden');
    document.getElementById('user-name').innerText = data.given_name;
    document.getElementById('user-photo').src = data.picture;
    document.getElementById('userName').value = data.name;
    localStorage.setItem('taxigo_name', data.name);
    document.querySelector('.g_id_signin').classList.add('hidden');
}

function switchTab(type) {
    const isUser = type === 'usuarios';
    document.getElementById('tab-usuarios').classList.toggle('hidden', !isUser);
    document.getElementById('tab-empresas').classList.toggle('hidden', isUser);
    document.getElementById('btn-usuarios').className = isUser ? 'px-8 py-3 rounded-xl text-xs font-black uppercase bg-white shadow-sm' : 'px-8 py-3 rounded-xl text-xs font-black uppercase text-slate-500';
    document.getElementById('btn-empresas').className = !isUser ? 'px-8 py-3 rounded-xl text-xs font-black uppercase bg-white shadow-sm' : 'px-8 py-3 rounded-xl text-xs font-black uppercase text-slate-500';
    lucide.createIcons();
}