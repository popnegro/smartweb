export type Prioridad = "Alta" | "Media" | "Baja";
export type Riesgo = "Crítico" | "Moderado" | "Bajo";
export type EstadoReclamo = "Nuevo" | "En curso" | "Esperando cliente" | "Resuelto";
export type Origen = "WhatsApp" | "Google Reviews" | "Email" | "Encuesta NPS" | "Llamada" | "Presencial";

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
    sentimiento: "Positivo" | "Negativo" | "Mixto" | "Neutro";
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
};

export type TrendPoint = { mes: string; nps: number; csat: number };

export type EstadoAuditoria = "Planificada" | "En curso" | "Completada" | "Cancelada";

export type Criticidad = "Alta" | "Media" | "Baja";

export type AccionCorrectiva = {
  id: string;
  descripcion: string;
  responsable: string;
  fechaLimite: string;
  estado: EstadoAccion;
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

export type EstadoAccion = "Pendiente" | "En curso" | "Completada";

export type Accion = {
  id: string;
  descripcion: string;
  tiempoRecomendado: string;
  estado: EstadoAccion;
  reclamoId: string;
  cliente: string;
};