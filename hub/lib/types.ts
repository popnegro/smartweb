export type Prioridad = "Alta" | "Media" | "Baja";
export type Riesgo = "Crítico" | "Moderado" | "Bajo";
export type Estado = "Nuevo" | "En curso" | "Esperando cliente" | "Resuelto";
export type Origen =
  | "WhatsApp"
  | "Google Reviews"
  | "Email"
  | "Encuesta NPS"
  | "Llamada"
  | "Presencial";

export interface Reclamo {
  id: string;
  cliente: string;
  vehiculo: string;
  patente: string;
  sucursal: string;
  area: string;
  estado: Estado;
  responsable: string;
  fecha: string; // ISO
  prioridad: Prioridad;
  riesgo: Riesgo;
  origen: Origen;
  ultimaInteraccion: string; // ISO
  satisfaccion: number; // 1-5
  detalle: string;
  ia: {
    resumen: string;
    sentimiento: "Negativo" | "Mixto" | "Neutro" | "Positivo";
    probabilidadAbandono: number; // 0-100
    accionSugerida: string;
    tiempoRecomendado: string;
  };
  timeline: { fecha: string; evento: string }[];
}

export interface SucursalKpi {
  sucursal: string;
  nps: number;
  reclamos: number;
  tiempoPromedioHoras: number;
  recuperados: number;
}

export interface TrendPoint {
  mes: string;
  nps: number;
  csat: number;
}
