/**
 * Este es un script de Node.js para probar el endpoint de la API en /api.
 *
 * Instrucciones:
 * 1. Asegúrate de que el servidor de desarrollo de Next.js esté corriendo.
 *    En una terminal, ejecuta: `npm run dev`
 * 2. En otra terminal, ejecuta este script: `node index.js`
 */

async function testApi() {
  // Un objeto de "reclamo" de ejemplo, similar a los de `lib/data.ts`
  const sampleReclamo = {
    id: "RC-1000",
    cliente: "Cliente de Prueba",
    vehiculo: "Toyota Corolla",
    patente: "AB123CD",
    sucursal: "Mendoza Centro",
    area: "Taller",
    estado: "Nuevo",
    responsable: "Ana Torres",
    fecha: new Date().toISOString(),
    prioridad: "Alta",
    riesgo: "Crítico",
    origen: "WhatsApp",
    detalle: "El cliente reclama que el problema reaparece tras el service.",
  };

  console.log("Enviando reclamo de prueba a la API en http://localhost:3000/api...");

  try {
    const response = await fetch('http://localhost:3000/api', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reclamo: sampleReclamo }),
    });

    if (!response.ok) {
      throw new Error(`Error de la API: ${response.status} ${response.statusText}`);
    }

    const analysis = await response.json();

    console.log("\n--- Análisis de la IA Recibido ---");
    console.log(analysis);
    console.log("------------------------------------\n");
  } catch (error) {
    console.error("\nError al contactar la API:", error.message);
    console.error("Asegúrate de que el servidor de desarrollo de Next.js esté corriendo y que la ANTHROPIC_API_KEY esté configurada en tu archivo .env.local.");
  }
}

testApi();