/**
 * WaaS CORE SYSTEM - Mendoza 2026
 */

const RATES = { flag: 1200, km: 650 }; // Precios Mendoza 2026

const AGENCIES = {
    "senorial": {
        name: "Señorial",
        phone: "5492613871088",
        color: "#facc15",
        bounds: "-69.0436,-33.1092,-68.6416,-32.7483",
        partners: ["Señorial Gold", "Luján Center", "Vistalba Vip"]
    },
    "default": {
        name: "TaxiGO",
        phone: "5492610000000",
        color: "#facc15",
        bounds: "-68.9000,-33.0500,-68.7500,-32.8000",
        partners: ["Mendoza Plaza", "Terminal", "Palmares", "Diplomatic"]
    }
};

const getAgency = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const agencyParam = urlParams.get('agency');
    const hostname = window.location.hostname.split('.')[0];
    return AGENCIES[agencyParam] || AGENCIES[hostname] || AGENCIES["default"];
};

const CURRENT_AGENCY = getAgency();
let map = null;
let orderData = { start: null, end: null, price: 0 };

document.addEventListener('DOMContentLoaded', () => {
    applyBranding();
    renderPartners();
    lucide.createIcons();
    
    const savedName = localStorage.getItem('user_name');
    if (savedName) document.getElementById('userName').value = savedName;
});

function applyBranding() {
    document.title = `${CURRENT_AGENCY.name} | Mendoza`;
    document.documentElement.style.setProperty('--primary', CURRENT_AGENCY.color);
    document.querySelectorAll('.agency-name').forEach(el => el.innerText = CURRENT_AGENCY.name);
    // Actualizar nombre de agencia en el footer
    document.querySelectorAll('.agency-name').forEach(el => {
        el.innerText = CURRENT_AGENCY.name;
    });

    // Cambiar favicon o colores si fuera necesario
    console.log(`Branding aplicado para: ${CURRENT_AGENCY.name}`);
}

async function getLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        orderData.start = [latitude, longitude];
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        document.getElementById('origin').value = data.address.road || "Mi Ubicación";
    });
}

async function searchMendoza(query) {
    const results = document.getElementById('results');
    if (query.length < 3) return results.classList.add('hidden');

    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Mendoza")}&viewbox=${CURRENT_AGENCY.bounds}&bounded=1&limit=4`);
    const data = await res.json();
    
    results.innerHTML = data.map(item => `
        <div class="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50" 
             onclick="selectDestination('${item.display_name.split(',')[0]}', ${item.lat}, ${item.lon})">
            <p class="font-bold text-sm text-black">${item.display_name.split(',')[0]}</p>
            <p class="text-[10px] text-slate-400 uppercase">${item.display_name.split(',').slice(1,3).join(',')}</p>
        </div>
    `).join('');
    results.classList.remove('hidden');
}

function selectDestination(name, lat, lon) {
    document.getElementById('destination').value = name;
    orderData.end = [parseFloat(lat), parseFloat(lon)];
    document.getElementById('results').classList.add('hidden');
}

async function toStep2() {
    if (!orderData.end || !orderData.start) return alert("Selecciona origen y destino");
    changeStep(2);
    await initMapWithRoute();
}

async function initMapWithRoute() {
    if (map) map.remove();
    map = L.map('map', { zoomControl: false }).setView(orderData.start, 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);

    try {
        const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${orderData.start[1]},${orderData.start[0]};${orderData.end[1]},${orderData.end[0]}?overview=full&geometries=geojson`);
        const data = await res.json();
        const route = data.routes[0];
        
        L.geoJSON(route.geometry, { style: { color: 'black', weight: 5 } }).addTo(map);
        
        // Calcular precio por distancia real
        const distanceKm = route.distance / 1000;
        orderData.price = Math.round(RATES.flag + (distanceKm * RATES.km));
        document.getElementById('display-price').innerText = `$${orderData.price}`;
        
        const bounds = L.geoJSON(route.geometry).getBounds();
        map.fitBounds(bounds, { padding: [30, 30] });
    } catch (e) { console.error("Route error", e); }
}

function sendToWhatsApp() {
    const name = document.getElementById('userName').value;
    localStorage.setItem('user_name', name);
    const msg = `*PEDIDO TAXI*\n👤 ${name}\n📍 Origen: ${document.getElementById('origin').value}\n🏁 Destino: ${document.getElementById('destination').value}\n💰 Tarifa: $${orderData.price}`;
    window.open(`https://wa.me/${CURRENT_AGENCY.phone}?text=${encodeURIComponent(msg)}`, '_blank');
    changeStep(3);
}

function changeStep(s) {
    [1,2,3].forEach(n => document.getElementById(`step-${n}`).classList.toggle('step-hidden', n !== s));
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, i) => {
        dot.className = (i === s-1) ? "step-dot w-6 h-1.5 rounded-full bg-black" : "step-dot w-1.5 h-1.5 rounded-full bg-black/20";
    });
    lucide.createIcons();
}

function renderPartners() {
    const html = CURRENT_AGENCY.partners.map(p => `<div class="logo-item">${p}</div>`).join('');
    document.querySelectorAll('.animate-marquee').forEach(el => el.innerHTML = html);
}

function switchTab(type) {
    const isUser = type === 'usuarios';
    const tabU = document.getElementById('tab-usuarios');
    const tabE = document.getElementById('tab-empresas');
    const btnU = document.getElementById('btn-usuarios');
    const btnE = document.getElementById('btn-empresas');

    // Toggle de visibilidad
    tabU.classList.toggle('hidden', !isUser);
    tabE.classList.toggle('hidden', isUser);

    // Estilos de botones (Metropolitan Style)
    if (isUser) {
        btnU.className = "px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 bg-white shadow-xl text-black";
        btnE.className = "px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500";
    } else {
        btnE.className = "px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 bg-white shadow-xl text-black";
        btnU.className = "px-10 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 text-slate-500";
    }
}