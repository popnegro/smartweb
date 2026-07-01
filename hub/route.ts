import { NextResponse } from "next/server";
import type { Reclamo } from "@/lib/types";

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:11434";

export async function POST(request: Request) {
  const { reclamo }: { reclamo: Reclamo } = await request.json();

  if (!reclamo) {
    return NextResponse.json({ error: "No se proporcionó el reclamo" }, { status: 400 });
  }

  const prompt = `
    Analiza el siguiente reclamo de un cliente de un concesionario de autos y responde únicamente con un objeto JSON.
    El reclamo es:
    - Cliente: ${reclamo.cliente}
    - Detalle: ${reclamo.detalle}
    - Prioridad: ${reclamo.prioridad}

    Genera un objeto JSON con la siguiente estructura y tipos:
    {
      "resumen": "string",
      "sentimiento": "Positivo" | "Negativo" | "Mixto" | "Neutro",
      "probabilidadAbandono": number,
      "accionSugerida": "string",
      "tiempoRecomendado": "string"
    }

    Ejemplo de respuesta:
    {
      "resumen": "El cliente se queja de que el problema original persiste después del servicio.",
      "sentimiento": "Negativo",
      "probabilidadAbandono": 85,
      "accionSugerida": "Contactar urgentemente, ofrecer un diagnóstico sin costo y escalar al gerente de postventa.",
      "tiempoRecomendado": "< 4 horas"
    }

    Tu respuesta debe ser solo el objeto JSON, sin texto adicional.
  `;

  try {
    const ollamaResponse = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: prompt,
        format: "json",
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      throw new Error(`Error de la API de Ollama: ${ollamaResponse.statusText}`);
    }

    const data = await ollamaResponse.json();
    const analysis = JSON.parse(data.response);

    return NextResponse.json(analysis);
  } catch (error: any) {
    console.error("Error al contactar Ollama:", error.message);
    return NextResponse.json({ error: "No se pudo contactar al motor de IA local (Ollama)." }, { status: 500 });
  }
}