// pages/api/procesar-imagen.js

import nc from 'next-connect';
import autenticacion from '../../middleware/autenticacion';
import fetch from 'node-fetch';
import getRawBody from 'raw-body';

const handler = nc()
  .use(autenticacion)
  .post(async (req, res) => {
    try {
      // Obtener el buffer de la imagen
      const imagenBuffer = await getRawBody(req);
      
      if (!imagenBuffer || imagenBuffer.length === 0) {
        return res.status(400).json({ mensaje: 'No se proporcionó ninguna imagen para procesar' });
      }

      // Codificar la imagen en base64
      const imagenBase64 = imagenBuffer.toString('base64');

      // Construir el contenido del mensaje para la API de Groq
      const messages = [
        {
          "role": "user",
          "content": [
            { "type": "text", "text": "What's in this image?" },
            {
              "type": "image_url",
              "image_url": {
                "url": `data:image/jpeg;base64,${imagenBase64}`,
              },
            },
          ],
        },
      ];

      // Hacer la solicitud a la API de Groq
      const response = await fetch('https://api.groq.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          messages: messages,
          model: 'llava-v1.5-7b-4096-preview',
        }),
      });

      const datosProcesados = await response.json();

      // Manejar posibles errores de la API de Groq
      if (!response.ok) {
        return res.status(response.status).json(datosProcesados);
      }

      // Opcional: Almacenar datosProcesados en la base de datos
      // ...

      res.status(200).json({
        mensaje: 'Imagen procesada correctamente',
        datos: datosProcesados,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al procesar la imagen con la API de Groq' });
    }
  });

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
