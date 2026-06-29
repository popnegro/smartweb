/**
 * Vercel Serverless Function
 * @param {import('@vercel/node').VercelRequest} req - The request object.
 * @param {import('@vercel/node').VercelResponse} res - The response object.
 */
export default function handler(req, res) {
  const { name = 'Mundo' } = req.query;
  res.status(200).send(`Hola, ${name}! Esta es tu primera función sin servidor.`);
}