import { createRouter } from 'next-connect';
import autenticacion from './middleware/autenticacion';
import fetch from 'node-fetch';
import getRawBody from 'raw-body';
import clientPromise from '../../lib/mongodb';

const router = createRouter();

router
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
            { "type": "text", "text": "Analyze the image and choose how to justify it according to the image provided: Initial mesophilic phase Color: Mix of light brown and green. Texture: Large and visible fragments, such as leaves or food remains. Humidity: Humid material, without signs of advanced decomposition. Thermophilic phase Color: Dark brown. Texture: More uniform material but with some visible fragments such as wood or shells. Other signs: There may be visible steam or signs of heat. Cooling phase Color: Dark brown. Texture: Looser and grainier, some small fragments may be present. Condition: No signs of heat.Maturation Phase Color: Dark brown or black.Texture: Very loose and grainy, without visible fragments.Condition: Fully stabilized material." },
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

   // Almacenar los datos en MongoDB
      const client = await clientPromise;
      const db = client.db('compost'); // Reemplaza con el nombre de tu base de datos
      const collection = db.collection('datos'); // Reemplaza con el nombre de tu colección

      const resultado = await collection.insertOne({
        messages,
        model: 'llava-v1.5-7b-4096-preview',
        respuesta: datosProcesados,
        fecha: new Date(),
      });

      console.log('Datos almacenados en MongoDB con ID:', resultado.insertedId);

      res.status(200).json({
        mensaje: 'Imagen procesada y datos almacenados correctamente',
        datos: datosProcesados,
      });
    } catch (error) {
     console.error('Error al procesar la imagen con la API de Groq:', error);
      res.status(500).json({ mensaje: 'Error al procesar la imagen con la API de Groq' });
    }
  });

export default router.handler({
  onError: (err, req, res) => {
    console.error('Error en el endpoint /api/procesar-imagen:', err);
    res.status(500).end(err.message);
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};
