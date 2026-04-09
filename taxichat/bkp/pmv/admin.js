// --- SEGURIDAD Y SESIÓN ---
const CLAVE_MAESTRA = "MiTaxi2026";

function verificarLogin() {
    const pass = document.getElementById('admin-pass').value;
    if (pass === CLAVE_MAESTRA) {
        sessionStorage.setItem('adminAutenticado', 'true');
        renderizarInterfazAdmin();
    } else {
        alert("Contraseña incorrecta.");
    }
}

function cerrarSesion() {
    sessionStorage.removeItem('adminAutenticado');
    location.reload();
}

// --- GESTIÓN DE PEDIDOS ---
function cargarDatosAdmin() {
    const pedidos = JSON.parse(localStorage.getItem('todosLosPedidos') || '[]');
    const tabla = document.getElementById('lista-pedidos');
    
    if (!tabla) return; // Seguridad por si el elemento no existe aún
    
    tabla.innerHTML = pedidos.map(p => `
        <tr>
            <td>
                <strong>${p.nombre}</strong><br>
                <small>📍 ${p.destino}</small><br>
                <small>💳 ${p.pago}</small>
            </td>
            <td>
                <button onclick="contactarPasajero('${p.telefono}', '${p.destino}')" style="background:#25D366; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                    WhatsApp
                </button>
                <button onclick="finalizarViaje('${p.id}')" class="danger" style="margin-top:5px;">
                    Finalizar
                </button>
            </td>
        </tr>
    `).join('');
}

function contactarPasajero(tel, destino) {
    const mensajeBase = document.getElementById('selector-mensajes').value;
    const url = `https://wa.me/${tel}?text=${encodeURIComponent(mensajeBase + " con destino a: " + destino)}`;
    window.open(url, '_blank');
}

function finalizarViaje(id) {
    let pedidos = JSON.parse(localStorage.getItem('todosLosPedidos') || '[]');
    let historial = JSON.parse(localStorage.getItem('historialViajes') || '[]');

    const index = pedidos.findIndex(p => p.id === id);
    if (index !== -1) {
        const viajeCompletado = pedidos.splice(index, 1)[0];
        viajeCompletado.fechaFin = new Date().toLocaleString();
        historial.push(viajeCompletado);

        localStorage.setItem('todosLosPedidos', JSON.stringify(pedidos));
        localStorage.setItem('historialViajes', JSON.stringify(historial));
        cargarDatosAdmin();
    }
}

// --- EXPORTACIÓN ---
function exportarCSV() {
    const historial = JSON.parse(localStorage.getItem('historialViajes') || '[]');
    if (historial.length === 0) return alert("No hay datos para exportar.");

    let csv = "Fecha,Cliente,Destino,Pago\n";
    historial.forEach(v => {
        csv += `${v.fechaFin},${v.nombre},${v.destino},${v.pago}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'historial_mitaxi.csv');
    a.click();
}

// --- INICIALIZACIÓN ---
function renderizarInterfazAdmin() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-content').style.display = 'block';
    cargarDatosAdmin();
}

window.onload = () => {
    if (sessionStorage.getItem('adminAutenticado') === 'true') {
        renderizarInterfazAdmin();
    }
};