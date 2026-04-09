        lucide.createIcons();
        
        let map, polyline, userData = { start: null, end: null, price: 0 };
        const MZA_BOUNDS = "-69.0436,-33.1092,-68.6416,-32.7483";

        // Inicialización y Cache de Nombre
        window.onload = () => {
            const savedName = localStorage.getItem('taxigo_name');
            if(savedName) document.getElementById('userName').value = savedName;
        };

        async function getLocation() {
            const btn = document.querySelector('button[onclick="getLocation()"]');
            btn.classList.add('animate-pulse');
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                userData.start = [latitude, longitude];
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                document.getElementById('origin').value = data.address.road || "Ubicación detectada";
                btn.classList.remove('animate-pulse');
            });
        }

        async function searchMendoza(query) {
            const results = document.getElementById('results');
            if(query.length < 3) return results.classList.add('hidden');
            
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&viewbox=${MZA_BOUNDS}&bounded=1&countrycodes=ar&limit=4`);
            const data = await res.json();
            
            results.innerHTML = '';
            results.classList.remove('hidden');
            data.forEach(item => {
                const div = document.createElement('div');
                div.className = "p-4 hover:bg-yellow-50 cursor-pointer transition-colors text-xs font-bold";
                div.innerHTML = `<div class="text-slate-900">${item.display_name.split(',')[0]}</div><div class="text-[10px] opacity-40 uppercase">${item.display_name.split(',')[1]}</div>`;
                div.onclick = () => {
                    document.getElementById('destination').value = item.display_name.split(',')[0];
                    userData.end = [parseFloat(item.lat), parseFloat(item.lon)];
                    results.classList.add('hidden');
                };
                results.appendChild(div);
            });
        }

        function toStep2() {
            const name = document.getElementById('userName').value;
            if(!name || !userData.end) return alert("Completa todos los campos");
            
            localStorage.setItem('taxigo_name', name);
            userData.price = Math.floor(Math.random() * (3500 - 1800) + 1800);
            document.getElementById('display-price').innerText = `$${userData.price}`;
            
            changeStep(2);
            setTimeout(initMap, 400);
        }

        function initMap() {
            if(map) map.remove();
            const start = userData.start || [-32.8895, -68.8458];
            map = L.map('map', { zoomControl: false, attributionControl: false }).setView(start, 13);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
            
            L.marker(start).addTo(map);
            L.marker(userData.end).addTo(map);
            
            polyline = L.polyline([start, userData.end], {color: '#000', weight: 4, dashArray: '10, 10'}).addTo(map);
            map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
        }

        function sendToWhatsApp() {
            const msg = `🚕 *NUEVO PEDIDO TAXIGO*\n👤 *Pasajero:* ${localStorage.getItem('taxigo_name')}\n📍 *Desde:* ${document.getElementById('origin').value}\n🏁 *Hacia:* ${document.getElementById('destination').value}\n💰 *Estimado:* $${userData.price}`;
            window.open(`https://wa.me/5492610000000?text=${encodeURIComponent(msg)}`, '_blank');
            changeStep(3);
        }

        function shareTrip() {
            if (navigator.share) {
                navigator.share({
                    title: 'Mi Viaje TaxiGO',
                    text: `Voy en camino hacia ${document.getElementById('destination').value}. Seguime!`,
                    url: window.location.href
                });
            }
        }

        function changeStep(s) {
            [1,2,3].forEach(n => document.getElementById(`step-${n}`).classList.add('step-hidden'));
            document.getElementById(`step-${s}`).classList.remove('step-hidden');
            
            const dots = document.getElementById('nav-dots').children;
            Array.from(dots).forEach((dot, i) => {
                dot.className = (i === (s-1)) ? "w-6 h-1.5 rounded-full bg-black" : "w-1.5 h-1.5 rounded-full bg-black/20";
            });

            const header = document.getElementById('widget-header');
            if(s === 3) header.className = "bg-green-500 p-8 transition-all duration-500";
            else header.className = "bg-yellow-400 p-8 transition-all duration-500";
        }

        function resetWidget() {
            location.reload();
        }
