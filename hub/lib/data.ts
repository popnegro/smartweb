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
  Comentario,
  FuenteComentario,
  CategoriaComentario,
  Sentimiento,
} from "./types";
import type { JourneyStage, NombreEtapa, EstadoEtapa, ChecklistTemplate, AccionCorrectiva } from "./types";

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

const ESTADOS_ACCION_KANBAN: EstadoAccion[] = ["Pendiente", "En curso", "Bloqueado", "Finalizado"];

const IMPACTOS_ESPERADOS = [
  "Mejora de NPS en 5 pts",
  "Reducción de tiempo de espera en 10%",
  "Aumento de satisfacción de cliente",
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
          accionesCorrectivas: Array.from({ length: int(1, 2) }, (__, k) => {
            const accion: AccionCorrectiva = {
              id: `AC-${hallazgoId}-${k}`,
              descripcion: `Implementar plan de acción para: ${HALLAZGOS_EJEMPLO[
                j % HALLAZGOS_EJEMPLO.length
              ].slice(0, 40)}...`,
              responsable: pick(RESPONSABLES),
              fechaLimite: new Date(fecha.getTime() + int(7, 30) * 24 * 60 * 60 * 1000).toISOString(),
              estado: pick(ESTADOS_ACCION_KANBAN),
              prioridad: pick(PRIORIDADES),
              area: pick(AREAS),
              costo: int(100, 1000),
              impactoEsperado: pick(IMPACTOS_ESPERADOS),
              origenId: `AU-${String(2000 + i)}`,
            };
            return accion;
          }),
        };
      }),
    });
  }
  return out.sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
}

const FUENTES_COMENTARIO: FuenteComentario[] = ["Google Reviews", "WhatsApp", "Email", "Encuesta NPS", "Facebook", "Instagram"];
const CATEGORIAS_COMENTARIO: CategoriaComentario[] = ["Demoras", "Atención", "Facturación", "Garantías", "Repuestos", "Entrega", "Calidad"];
const SENTIMIENTOS: Sentimiento[] = ["Positivo", "Negativo", "Mixto", "Neutro"];

const CONTENIDOS_COMENTARIO = [
  {
    contenido: "El servicio fue excelente, muy rápido y el personal muy amable. ¡Volveré sin dudarlo!",
    sentimiento: "Positivo",
    categoria: "Atención",
    palabrasClave: ["excelente", "rápido", "amable"],
  },
  {
    contenido: "Tuve que esperar más de una hora para que me atendieran, a pesar de tener turno. La demora fue excesiva.",
    sentimiento: "Negativo",
    categoria: "Demoras",
    palabrasClave: ["esperar", "demora", "excesiva"],
  },
  {
    contenido: "El arreglo quedó bien, pero el precio final fue más alto de lo que me habían cotizado inicialmente.",
    sentimiento: "Mixto",
    categoria: "Facturación",
    palabrasClave: ["precio", "cotizado", "alto"],
  },
  {
    contenido: "No tenían el repuesto que necesitaba y tardaron dos semanas en conseguirlo. Poca comunicación durante el proceso.",
    sentimiento: "Negativo",
    categoria: "Repuestos",
    palabrasClave: ["repuesto", "tardaron", "comunicación"],
  },
  {
    contenido: "La entrega del 0km fue un momento mágico. Todo el equipo se portó de maravilla. Gracias!",
    sentimiento: "Positivo",
    categoria: "Entrega",
    palabrasClave: ["entrega", "mágico", "maravilla"],
  },
  {
    contenido: "El auto sigue haciendo el mismo ruido que cuando lo llevé. No solucionaron el problema de calidad.",
    sentimiento: "Negativo",
    categoria: "Calidad",
    palabrasClave: ["ruido", "calidad", "solucionaron"],
  },
];

function generarComentarios(cantidad: number): Comentario[] {
  const out: Comentario[] = [];
  for (let i = 0; i < cantidad; i++) {
    const data = pick(CONTENIDOS_COMENTARIO);
    out.push({
      id: `COM-${1000 + i}`,
      fuente: pick(FUENTES_COMENTARIO),
      cliente: pick(NOMBRES),
      fecha: new Date(Date.now() - int(0, 60) * 24 * 60 * 60 * 1000).toISOString(),
      contenido: data.contenido,
      ia: { sentimiento: data.sentimiento as Sentimiento, categoria: data.categoria as CategoriaComentario, palabrasClave: data.palabrasClave },
    });
  }
  return out.sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha));
}

function generarPlanesDeAccion(): AccionCorrectiva[] {
  const acciones: AccionCorrectiva[] = [];
  AUDITORIAS.forEach((auditoria) => {
    auditoria.hallazgos.forEach((hallazgo) => {
      hallazgo.accionesCorrectivas.forEach((ac) => {
        acciones.push({
          ...ac,
          prioridad: hallazgo.criticidad,
          area: auditoria.area,
          costo: int(50, 500),
          impactoEsperado: pick(IMPACTOS_ESPERADOS),
          origenId: auditoria.id,
          // Asegurarse de que el estado sea válido para el Kanban
          estado: pick(ESTADOS_ACCION_KANBAN),
        });
      });
    });
  });
  return acciones;
}

export const CHECKLIST_TEMPLATE: ChecklistTemplate = [
  {
    id: "recepcion",
    nombre: "Recepción y Taller",
    items: [
      { id: "recepcion-1", nombre: "Limpieza y orden del área", descripcion: "El área de recepción de vehículos está limpia, ordenada y libre de obstáculos." },
      { id: "recepcion-2", nombre: "Uniformidad del personal", descripcion: "Los asesores de servicio visten el uniforme completo y limpio." },
      { id: "recepcion-3", nombre: "Tiempos de espera", descripcion: "El cliente es atendido en menos de 5 minutos desde su llegada." },
      { id: "recepcion-4", nombre: "Uso de cobertor y protección", descripcion: "Se utilizan cobertores de asiento, volante y palanca de cambios en todos los vehículos." },
    ],
  },
  {
    id: "sala-espera",
    nombre: "Sala de Espera",
    items: [
      { id: "sala-1", nombre: "Limpieza y confort", descripcion: "La sala de espera está limpia, con temperatura agradable y asientos cómodos." },
      { id: "sala-2", nombre: "Disponibilidad de servicios", descripcion: "Hay disponible Wi-Fi, café y agua para los clientes." },
      { id: "sala-3", nombre: "Material de lectura actualizado", descripcion: "Se ofrece material de lectura reciente y en buen estado." },
    ],
  },
  {
    id: "documentacion",
    nombre: "Documentación y Procesos",
    items: [
      { id: "doc-1", nombre: "Orden de reparación clara", descripcion: "La orden de reparación es clara, legible y está firmada por el cliente." },
      { id: "doc-2", nombre: "Presupuesto detallado", descripcion: "El presupuesto entregado al cliente detalla mano de obra y repuestos." },
      { id: "doc-3", nombre: "Registro en CRM", descripcion: "Toda la interacción con el cliente está debidamente registrada en el sistema." },
    ],
  },
];

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    nombre: "Reserva",
    tiempoPromedio: "5 min",
    estado: "Positivo",
    kpi: { nombre: "Tasa de conversión", valor: "95%", tendencia: "up" },
    ia: { insight: null, impactoNPS: 2 },
  },
  {
    nombre: "Recepción",
    tiempoPromedio: "25 min",
    estado: "Negativo",
    kpi: { nombre: "Tiempo de espera", valor: "15 min", tendencia: "down" },
    ia: {
      insight: "Cuello de botella detectado. El tiempo de espera supera el objetivo en un 50%.",
      impactoNPS: -8,
    },
  },
  {
    nombre: "Diagnóstico",
    tiempoPromedio: "1.5 hs",
    estado: "Neutral",
    kpi: { nombre: "Precisión", valor: "92%", tendencia: "neutral" },
    ia: { insight: "Oportunidad de mejora en la comunicación con el cliente sobre el diagnóstico.", impactoNPS: -1 },
  },
  {
    nombre: "Taller",
    tiempoPromedio: "2 días",
    estado: "Neutral",
    kpi: { nombre: "Cumplimiento de plazos", valor: "88%", tendencia: "up" },
    ia: { insight: null, impactoNPS: 0 },
  },
  {
    nombre: "Entrega",
    tiempoPromedio: "35 min",
    estado: "Crítico",
    kpi: { nombre: "Satisfacción en entrega", valor: "7.2/10", tendencia: "down" },
    ia: { insight: "Fricción crítica: los clientes reportan falta de claridad en la facturación.", impactoNPS: -12 },
  },
  {
    nombre: "Encuesta",
    tiempoPromedio: "N/A",
    estado: "Positivo",
    kpi: { nombre: "Tasa de respuesta", valor: "45%", tendencia: "up" },
    ia: { insight: null, impactoNPS: 5 },
  },
];

// --- Mock Data Fetching Functions ---

const RECLAMOS: Reclamo[] = generarReclamos(42);
const AUDITORIAS: Auditoria[] = generarAuditorias(18);
const COMENTARIOS: Comentario[] = generarComentarios(120);
const PLANES_DE_ACCION: AccionCorrectiva[] = generarPlanesDeAccion();

export const SUCURSAL_KPIS: SucursalKpi[] = SUCURSALES.map((s) => {
  const reclamosSucursal = RECLAMOS.filter((r) => r.sucursal === s);
  const auditoriasSucursal = AUDITORIAS.filter((a) => a.sucursal === s);
  const auditoriasCompletadas = auditoriasSucursal.filter((a) => a.estado === "Completada");
  const cumplimiento =
    auditoriasCompletadas.length > 0
      ? Math.round(auditoriasCompletadas.reduce((acc, a) => acc + a.puntuacion, 0) / auditoriasCompletadas.length)
      : 0;

  return {
    sucursal: s,
    nps: int(38, 78),
    reclamos: reclamosSucursal.length,
    tiempoPromedioHoras: int(6, 48),
    recuperados: reclamosSucursal.filter((r) => r.estado === "Resuelto").length,
    auditoriasCompletadas: auditoriasCompletadas.length,
    cumplimiento,
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

// Simulate API calls to fetch data asynchronously
export const getReclamos = async () => Promise.resolve(RECLAMOS);
export const getAuditorias = async () => Promise.resolve(AUDITORIAS);
export const getComentarios = async () => Promise.resolve(COMENTARIOS);
export const getPlanesDeAccion = async () => Promise.resolve(PLANES_DE_ACCION);
export const getReclamoById = async (id: string) => Promise.resolve(RECLAMOS.find((r) => r.id === id));
