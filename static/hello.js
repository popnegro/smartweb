/**
 * /api/hello.js
 *
 * Ejemplo de una Serverless Function en Vercel.
 * Responde a peticiones GET en la ruta /api/hello.
 */
export default function handler(request, response) {
  const { name } = request.query;
  response.status(200).json({
    message: `Hola, ${name || 'mundo'}! Esta es una respuesta desde una Serverless Function.`
  });
}