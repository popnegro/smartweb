module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/lib/data.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "businesses",
    ()=>businesses,
    "inboxItems",
    ()=>inboxItems,
    "metrics",
    ()=>metrics,
    "qaChecks",
    ()=>qaChecks,
    "rubricFlows",
    ()=>rubricFlows
]);
const metrics = [
    {
        label: "Consultas nuevas",
        value: "128",
        delta: "+24 esta semana"
    },
    {
        label: "Llamadas generadas",
        value: "47",
        delta: "+11 vs. semana anterior"
    },
    {
        label: "Tiempo de respuesta",
        value: "6m",
        delta: "objetivo menor a 10m"
    },
    {
        label: "Presupuestos abiertos",
        value: "31",
        delta: "14 con seguimiento pendiente"
    }
];
const businesses = [
    {
        id: "ferreteria-centro",
        name: "Ferreteria Centro",
        category: "Ferreteria",
        neighborhood: "Godoy Cruz",
        opportunityScore: 92,
        status: "diagnosed",
        signals: [
            "sin WhatsApp visible",
            "pocas fotos",
            "horario incompleto"
        ]
    },
    {
        id: "taller-los-andes",
        name: "Taller Los Andes",
        category: "Taller mecanico",
        neighborhood: "Guaymallen",
        opportunityScore: 88,
        status: "contacted",
        signals: [
            "alta demanda",
            "sin turnos online",
            "responde tarde"
        ]
    },
    {
        id: "peluqueria-norte",
        name: "Peluqueria Norte",
        category: "Peluqueria",
        neighborhood: "Las Heras",
        opportunityScore: 81,
        status: "discovery",
        signals: [
            "sin reservas",
            "resenias antiguas",
            "telefono dudoso"
        ]
    },
    {
        id: "tecnico-rapido",
        name: "Tecnico Rapido",
        category: "Servicio tecnico",
        neighborhood: "Ciudad",
        opportunityScore: 77,
        status: "active",
        signals: [
            "landing activa",
            "inbox conectado",
            "GBP autorizado"
        ]
    }
];
const inboxItems = [
    {
        id: "msg-001",
        customer: "Laura M.",
        message: "Consulta por copia de llave y envio a domicilio.",
        stage: "Nuevo"
    },
    {
        id: "msg-002",
        customer: "Jorge P.",
        message: "Pide presupuesto para frenos y turno esta semana.",
        stage: "Presupuestar"
    },
    {
        id: "msg-003",
        customer: "Carolina R.",
        message: "Quiere reprogramar reserva de corte y color.",
        stage: "Responder"
    }
];
const rubricFlows = [
    {
        category: "Ferreteria",
        flow: "Producto, stock, alternativa, retiro o envio."
    },
    {
        category: "Taller",
        flow: "Sintoma, urgencia, turno, presupuesto y seguimiento."
    },
    {
        category: "Servicio tecnico",
        flow: "Equipo, falla, marca, visita o entrega."
    }
];
const qaChecks = [
    "Descubrimiento sin usar la API oficial de GBP para terceros.",
    "Integracion GBP limitada a clientes autorizados.",
    "Metricas enfocadas en consultas, llamadas y presupuestos.",
    "Datos semilla disponibles por API para pruebas QA."
];
}),
"[project]/app/api/businesses/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/data.ts [app-route] (ecmascript)");
;
;
function GET() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        data: __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$data$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["businesses"],
        sourcePolicy: {
            discovery: "Prospeccion basada en fuentes publicas, relevamiento propio y carga comercial.",
            googleBusinessProfile: "Gestion disponible solo con autorizacion del propietario o administrador del perfil."
        }
    });
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1ede56p._.js.map