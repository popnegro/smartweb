require('dotenv').config();

// Uso en Mercado Pago
const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
});

// Uso en Google Auth
const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();

// 1. Configuración de Middleware
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);

// 2. Configuración de Socket.io (Corregida)
const io = new Server(httpServer, {
    cors: {
        // Los orígenes deben estar en un array para permitir múltiples direcciones
        origin: ["http://127.0.0.1:5500", "https://taxichat-nine.vercel.app"],
        methods: ["GET", "POST"]
    }
});

// 3. Configuración Mercado Pago
const client = new MercadoPagoConfig({ 
    accessToken: 'TU_ACCESS_TOKEN_AQUÍ' 
});

// 4. Endpoint para Mercado Pago
app.post('/create-preference', async (req, res) => {
    try {
        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [{
                    title: req.body.title,
                    unit_price: Number(req.body.price),
                    quantity: 1,
                    currency_id: 'ARS' 
                }],
                back_urls: {
                    // Nota: Cambia esto a tu URL de Vercel cuando despliegues el frontend
                    success: "https://taxichat-nine.vercel.app/success.html",
                    failure: "https://taxichat-nine.vercel.app/failure.html",
                },
                auto_return: "approved",
            }
        });

        res.json({ init_point: result.init_point });
    } catch (error) {
        console.error("Error MP:", error);
        res.status(500).send("Error al crear preferencia");
    }
});

// 5. Lógica de Sockets
io.on('connection', (socket) => {
    console.log('📱 Dispositivo conectado:', socket.id);

    socket.on('asignar-taxi', (data) => {
        io.emit('confirmacion-cliente', data);
    });

    socket.on('enviar-link-pago', (data) => {
        io.emit('recibir-pago', data);
    });

    socket.on('disconnect', () => {
        console.log('❌ Dispositivo desconectado');
    });
});

// 6. Encender servidor
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});