const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const cors = require('cors');
// Importar Mercado Pago
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "http://127.0.0.1:5500" }
});

// --- CONFIGURACIÓN MERCADO PAGO ---
const client = new MercadoPagoConfig({ 
    accessToken: 'TU_ACCESS_TOKEN_AQUÍ' // <--- Pega aquí tu token
});

app.post('/create-preference', async (req, res) => {
    try {
        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [{
                    title: req.body.title,
                    unit_price: Number(req.body.price),
                    quantity: 1,
                    currency_id: 'ARS' // Cambia según tu país
                }],
                back_urls: {
                    success: "http://127.0.0.1:5500/success.html",
                },
                auto_return: "approved",
            }
        });

        // Enviamos el link generado
        res.json({ init_point: result.init_point });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al crear preferencia");
    }
});

// --- LÓGICA DE SOCKETS ---
io.on('connection', (socket) => {
    console.log('📱 Dispositivo conectado:', socket.id);

    socket.on('asignar-taxi', (data) => {
        // Al asignar, también podemos enviar el link de pago si ya existe
        io.emit('confirmacion-cliente', data);
    });

    // Nuevo: El dashboard avisa que el pago está listo
    socket.on('enviar-link-pago', (data) => {
        io.emit('recibir-pago', data);
    });
});

httpServer.listen(3000, () => {
    console.log('✅ Servidor y Mercado Pago listos en el puerto 3000');
});