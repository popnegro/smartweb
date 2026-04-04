// Inicialización básica del mapa
const map = L.map('map').setView([-32.8895, -68.8458], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

function iniciarPedido() {
    // Captura segura de elementos
    const elNombre = document.getElementById('nombre');
    const elDestino = document.getElementById('destino');
    const elTelefono = document.getElementById('telefono');
    const elPago = document.getElementById('pago');

    // Validación: si el elemento no existe en el HTML, avisa por consola
    if (!elNombre || !elDestino || !elTelefono || !elPago) {
        console.error("Error: ¡Uno de los IDs del formulario no existe en el HTML!");
        return;
    }

    const pedido = {
        id: Date.now().toString().slice(-5),
        nombre: elNombre.value,
        destino: elDestino.value,
        telefono: elTelefono.value,
        pago: elPago.value,
        fecha: new Date().toLocaleTimeString()
    };

    // Validación de formato telefónico
    if (!/^[0-9]{10,}$/.test(pedido.telefono)) {
        alert("Por favor, ingresa un teléfono válido (al menos 10 dígitos).");
        return;
    }

    // Guardado en LocalStorage
    let pedidos = JSON.parse(localStorage.getItem('todosLosPedidos') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('todosLosPedidos', JSON.stringify(pedidos));

    alert("¡Pedido realizado con éxito!");
    
    // Limpiar formulario tras éxito
    document.getElementById('form-pedido').reset();
}