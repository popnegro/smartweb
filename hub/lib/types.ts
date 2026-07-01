export type Prioridad = "Alta" | "Media" | "Baja";
export type Riesgo = "Crítico" | "Moderado" | "Bajo";
export type EstadoReclamo = "Nuevo" | "En curso" | "Esperando cliente" | "Resuelto";
export type Origen = "WhatsApp" | "Google Reviews" | "Email" | "Encuesta NPS" | "Llamada" | "Presencial";
export type Sentimiento = "Positivo" | "Negativo" | "Mixto" | "Neutro";
export type Reclamo = {
  id: string;
  cliente: string;
  vehiculo: string;
  patente: string;
  sucursal: string;
  area: string;
  estado: EstadoReclamo;
  responsable: string;
  fecha: string;
  prioridad: Prioridad;
  riesgo: Riesgo;
  origen: Origen;
  ultimaInteraccion: string;
  satisfaccion: number;
  detalle: string;
  ia: {
    resumen: string;
    sentimiento: Sentimiento;
    probabilidadAbandono: number;
    accionSugerida: string;
    tiempoRecomendado: string;
  };
  timeline: {
    fecha: string;
    evento: string;
  }[];
};

export type SucursalKpi = {
  sucursal: string;
  nps: number;
  reclamos: number;
  tiempoPromedioHoras: number;
  recuperados: number;
  auditoriasCompletadas: number;
  cumplimiento: number;
};

export type TrendPoint = { mes: string; nps: number; csat: number };

export type EstadoAuditoria = "Planificada" | "En curso" | "Completada" | "Cancelada";

export type Criticidad = "Alta" | "Media" | "Baja";

export type EstadoAccion = "Pendiente" | "En curso" | "Bloqueado" | "Finalizado";

export type AccionCorrectiva = {
  id: string;
  descripcion: string;
  responsable: string;
  fechaLimite: string;
  estado: EstadoAccion;
  prioridad: Prioridad;
  area: string;
  costo: number;
  impactoEsperado: string;
  origenId: string;
};

export type Hallazgo = {
  id: string;
  descripcion: string;
  criticidad: Criticidad;
  accionesCorrectivas: AccionCorrectiva[];
};

export type Auditoria = {
  id: string;
  fecha: string;
  sucursal: string;
  area: string;
  puntuacion: number;
  estado: EstadoAuditoria;
  responsable: string;
  hallazgos: Hallazgo[];
};

export type Accion = {
  id: string;
  descripcion: string;
  tiempoRecomendado: string;
  estado: EstadoAccion;
  reclamoId: string;
  cliente: string;
};

export type FuenteComentario = "Google Reviews" | "WhatsApp" | "Email" | "Encuesta NPS" | "Facebook" | "Instagram";
export type CategoriaComentario = "Demoras" | "Atención" | "Facturación" | "Garantías" | "Repuestos" | "Entrega" | "Calidad";

export type Comentario = {
  id: string;
  fuente: FuenteComentario;
  cliente: string;
  fecha: string;
  contenido: string;
  ia: {
    sentimiento: Sentimiento;
    categoria: CategoriaComentario;
    palabrasClave: string[];
  };
};

export type EstadoEtapa = "Positivo" | "Neutral" | "Negativo" | "Crítico";
export type NombreEtapa = "Reserva" | "Recepción" | "Diagnóstico" | "Taller" | "Entrega" | "Encuesta";

export type JourneyStage = {
  nombre: NombreEtapa;
  tiempoPromedio: string;
  estado: EstadoEtapa;
  kpi: {
    nombre: string;
    valor: string;
    tendencia: "up" | "down" | "neutral";
  };
  ia: {
    insight: string | null;
    impactoNPS: number; // e.g., -5, 2, 0
  };
};

export type ChecklistItem = {
  id: string;
  nombre: string;
  descripcion: string;
};

export type ChecklistCategory = {
  id: string;
  nombre: string;
  items: ChecklistItem[];
};

export type ChecklistTemplate = ChecklistCategory[];

export type ChatMessage = {
  id: string;
  role: "user" | "ai";
  content: React.ReactNode;
};