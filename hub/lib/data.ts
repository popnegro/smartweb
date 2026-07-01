import type {
  Reclamo,
  SucursalKpi,
  TrendPoint,
  Prioridad,
  Riesgo,
  EstadoReclamo,
  Origen,
  Auditoria,
  EstadoAuditoria,
  Accion,
  EstadoAccion,
  Hallazgo,
  Criticidad,
} from "./types";

// PRNG simple con semilla fija para que los datos sean siempre los mismos
// entre build y deploy (reproducible, sin librerías externas).
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}
const rand = seededRandom(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

export const SUCURSALES = [
  "Mendoza Centro",
  "Mendoza Norte",
  "Guaymallén",
  "Godoy Cruz",
  "Las Heras",
  "Maipú",
  "San Rafael",
  "Luján de Cuyo",
];

const MARCAS = ["Toyota", "Hyundai", "Peugeot", "Chevrolet", "Renault"];
const AREAS = ["Postventa", "Taller", "Recepción", "Repuestos", "Comercial", "Garantías"];
const NOMBRES = [
  "Lucía Fernández", "Martín Gómez", "Sofía Rodríguez", "Diego Pereyra", "Valentina Suárez",
  "Nicolás Ortiz", "Camila Acosta", "Tomás Bravo", "Florencia Romero", "Agustín Molina",
  "Julieta Paz", "Ezequiel Castro", "Mariana Luna", "Federico Ríos", "Carolina Vega",
  "Santiago Funes", "Brenda Quiroga", "Joaquín Aguirre", "Daniela Correa", "Ramiro Salinas",
];
const RESPONSABLES = [
  "Ana Torres", "Pablo Sosa", "Laura Méndez", "Gustavo Díaz", "Cecilia Navarro",
  "Rodrigo Ibáñez", "Verónica Paz", "Esteban Ledesma", "Patricia Ruiz", "Marcos Iturri",
  "Silvina Castro", "Hernán Cabrera",
];
const ORIGENES: Origen[] = ["WhatsApp", "Google Reviews", "Email", "Encuesta NPS", "Llamada", "Presencial"];
const ESTADOS_RECLAMO: EstadoReclamo[] = ["Nuevo", "En curso", "Esperando cliente", "Resuelto"];
const PRIORIDADES: Prioridad[] = ["Alta", "Media", "Baja"];

const MOTIVOS = [
  { area: "Taller", detalle: "Demora en la entrega del vehículo respecto a lo pactado." },
  { area: "Postventa", detalle: "El cliente reclama que el problema reaparece tras el service." },
  { area: "Recepción", detalle: "Trato poco cordial al momento de la recepción del vehículo." },
  { area: "Repuestos", detalle: "Repuesto importado con demora de entrega no informada a tiempo." },
  { area: "Garantías", detalle: "Disconformidad con el alcance de cobertura de garantía aplicado." },
  { area: "Comercial", detalle: "Diferencia entre lo cotizado y el monto final facturado." },
  { area: "Taller", detalle: "Vehículo entregado con un desperfecto distinto al original." },
  { area: "Postventa", detalle: "Encuesta NPS con comentario negativo sobre tiempos de espera." },
];

function buildIA(prioridad: Prioridad, riesgo: Riesgo, motivo: string) {
  const sentimiento =
    riesgo === "Crítico" ? "Negativo" : riesgo === "Moderado" ? "Mixto" : "Neutro";
  const probabilidadAbandono =
    riesgo === "Crítico" ? int(65, 92) : riesgo === "Moderado" ? int(30, 60) : int(5, 25);
  const accionSugerida =
    riesgo === "Crítico"
      ? "Contactar al cliente en menos de 4 horas, ofrecer compensación y escalar a jefe de sucursal."
      : riesgo === "Moderado"
      ? "Contactar dentro de las 24 horas y confirmar plan de resolución con el área responsable."
      : "Realizar seguimiento estándar y cerrar con encuesta de satisfacción.";
  const tiempoRecomendado =
    riesgo === "Crítico" ? "< 4 horas" : riesgo === "Moderado" ? "< 24 horas" : "< 72 horas";

  return {
    resumen: `Caso de prioridad ${prioridad.toLowerCase()} vinculado a ${motivo.toLowerCase()} Requiere seguimiento del área correspondiente.`,
    sentimiento: sentimiento as "Negativo" | "Mixto" | "Neutro" | "Positivo",
    probabilidadAbandono,
    accionSugerida,
    tiempoRecomendado,
  };
}

function buildTimeline(fechaBase: Date, estado: EstadoReclamo) {
  const fmt = (d: Date) => d.toISOString();
  const events = [
    { offset: 0, evento: "Reclamo recibido y registrado en el sistema." },
    { offset: 1, evento: "Caso clasificado automáticamente y asignado a responsable." },
  ];
  if (estado !== "Nuevo") {
    events.push({ offset: 2, evento: "Primer contacto realizado con el cliente." });
  }
  if (estado === "Esperando cliente") {
    events.push({ offset: 3, evento: "Se envió propuesta de solución, en espera de confirmación." });
  }
  if (estado === "Resuelto") {
    events.push({ offset: 3, evento: "Solución aplicada y validada con el área responsable." });
    events.push({ offset: 4, evento: "Caso cerrado. Encuesta de satisfacción enviada." });
  }
  return events.map((e) => ({
    fecha: fmt(new Date(fechaBase.getTime() + e.offset * 1000 * 60 * 60 * 18)),
    evento: e.evento,
  }));
}

function generarReclamos(cantidad: number): Reclamo[] {
  const out: Reclamo[] = [];
  for (let i = 0; i < cantidad; i++) {
    const motivo = pick(MOTIVOS);
    const prioridad = pick(PRIORIDADES);
    const riesgo: Riesgo =
      prioridad === "Alta" ? pick(["Crítico", "Moderado"]) : prioridad === "Media" ? "Moderado" : pick(["Bajo", "Moderado"]);
    const diasAtras = int(0, 45);
    const fecha = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000);
    const estado = pick(ESTADOS_RECLAMO);
    const marca = pick(MARCAS);

    out.push({
      id: `RC-${String(1000 + i)}`,
      cliente: pick(NOMBRES),
      vehiculo: `${marca} ${pick(["Corolla", "HR-V", "208", "Tracker", "Sandero", "Hilux", "Onix", "Kwid"])}`,
      patente: `A${int(100, 999)}${pick(["AB", "CD", "EF", "GH"])}`,
      sucursal: pick(SUCURSALES),
      area: motivo.area,
      estado,
      responsable: pick(RESPONSABLES),
      fecha: fecha.toISOString(),
      prioridad,
      riesgo,
      origen: pick(ORIGENES),
      ultimaInteraccion: new Date(fecha.getTime() + int(1, 4) * 86400000).toISOString(),
      satisfaccion: riesgo === "Crítico" ? int(1, 2) : riesgo === "Moderado" ? int(2, 3) : int(3, 5),
      detalle: motivo.detalle,
      ia: buildIA(prioridad, riesgo, motivo.detalle),
      timeline: buildTimeline(fecha, estado),
    });
  }
  // Más recientes primero
  return out.sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
}

export const RECLAMOS: Reclamo[] = generarReclamos(42);

const ESTADOS_ACCION: EstadoAccion[] = ["Pendiente", "En curso", "Completada"];

function generarAcciones(): Accion[] {
  return RECLAMOS.filter((r) => r.estado !== "Resuelto").map((reclamo) => ({
    id: `act-${reclamo.id}`,
    descripcion: reclamo.ia.accionSugerida,
    tiempoRecomendado: reclamo.ia.tiempoRecomendado,
    estado: pick(ESTADOS_ACCION),
    reclamoId: reclamo.id,
    cliente: reclamo.cliente,
  }));
}

export const ACCIONES: Accion[] = generarAcciones();

const ESTADOS_AUDITORIA: EstadoAuditoria[] = ["Planificada", "En curso", "Completada", "Cancelada"];

const CRITICIDAD: Criticidad[] = ["Alta", "Media", "Baja"];
const HALLAZGOS_EJEMPLO = [
  "Falta de seguimiento en reclamos abiertos hace más de 15 días.",
  "Procesos de recepción de vehículos no estandarizados entre turnos.",
  "Inventario de repuestos con discrepancias en sistema vs. físico.",
  "Documentación de garantías incompleta en 10% de los casos revisados.",
  "Tiempos de espera en la línea de postventa superan el objetivo de 5 minutos.",
  "Falta de capacitación del personal nuevo en el uso del CRM.",
];

function generarAuditorias(cantidad: number): Auditoria[] {
  const out: Auditoria[] = [];
  for (let i = 0; i < cantidad; i++) {
    const diasAtras = int(0, 90);
    const fecha = new Date(Date.now() - diasAtras * 24 * 60 * 60 * 1000);
    out.push({
      id: `AU-${String(2000 + i)}`,
      fecha: fecha.toISOString(),
      sucursal: pick(SUCURSALES),
      area: pick(AREAS),
      puntuacion: int(75, 98),
      estado: pick(ESTADOS_AUDITORIA),
      responsable: pick(RESPONSABLES),
      hallazgos: Array.from({ length: int(2, 4) }, (_, j) => {
        const hallazgoId = `H${i * 5 + j}`;
        return {
          id: hallazgoId,
          descripcion: pick(HALLAZGOS_EJEMPLO),
          criticidad: pick(CRITICIDAD),
          accionesCorrectivas: Array.from({ length: int(1, 2) }, (__, k) => ({
            id: `AC-${hallazgoId}-${k}`,
            descripcion: `Implementar plan de acción para: ${HALLAZGOS_EJEMPLO[j % HALLAZGOS_EJEMPLO.length].slice(0, 40)}...`,
            responsable: pick(RESPONSABLES),
            fechaLimite: new Date(
              fecha.getTime() + int(7, 30) * 24 * 60 * 60 * 1000
            ).toISOString(),
            estado: pick(ESTADOS_ACCION),
          })),
        };
      }),
    });
  }
  return out.sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
}

export const AUDITORIAS: Auditoria[] = generarAuditorias(18);

export const SUCURSAL_KPIS: SucursalKpi[] = SUCURSALES.map((s) => {
  const reclamosSucursal = RECLAMOS.filter((r) => r.sucursal === s);
  return {
    sucursal: s,
    nps: int(38, 78),
    reclamos: reclamosSucursal.length,
    tiempoPromedioHoras: int(6, 48),
    recuperados: reclamosSucursal.filter((r) => r.estado === "Resuelto").length,
  };
}).sort((a, b) => b.nps - a.nps);

export const TREND: TrendPoint[] = [
  { mes: "Ene", nps: 58, csat: 81 },
  { mes: "Feb", nps: 61, csat: 80 },
  { mes: "Mar", nps: 55, csat: 76 },
  { mes: "Abr", nps: 63, csat: 83 },
  { mes: "May", nps: 59, csat: 79 },
  { mes: "Jun", nps: 66, csat: 85 },
];

export function getDashboardKpis() {
  const reclamosAbiertos = RECLAMOS.filter((r) => r.estado !== "Resuelto");
  const criticos = RECLAMOS.filter((r) => r.riesgo === "Crítico" && r.estado !== "Resuelto");
  const tiempoProm =
    SUCURSAL_KPIS.reduce((acc, s) => acc + s.tiempoPromedioHoras, 0) / SUCURSAL_KPIS.length;
  const npsActual = TREND[TREND.length - 1].nps;
  const csatActual = TREND[TREND.length - 1].csat;

  return {
    nps: npsActual,
    csat: csatActual,
    totalReclamos: RECLAMOS.length,
    reclamosAbiertos: reclamosAbiertos.length,
    clientesCriticos: criticos.length,
    tiempoPromedioHoras: Math.round(tiempoProm),
  };
}
