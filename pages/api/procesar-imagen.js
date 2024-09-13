// pages/api/procesar-imagen.js

import nextConnect from 'next-connect';
import autenticacion from './middleware/autenticacion';

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Error en el middleware: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  },
});

apiRoute.use(autenticacion);

apiRoute.post(async (req, res) => {
  const imagen = req.body.imagen; // Asegúrate de que la imagen se envía correctamente
  if (!imagen) {
    return res.status(400).json({ mensaje: 'No se proporcionó ninguna imagen para procesar' });
  }

  try {
    const respuesta = await fetch('https://api.groq.com/procesar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: imagen,
    });

    const datosProcesados = await respuesta.json();

    res.status(200).json(datosProcesados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al procesar la imagen con la API de Groq' });
  }
});

export default apiRoute;
