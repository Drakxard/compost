// pages/api/imagenes.js

import { createRouter } from 'next-connect';
import autenticacion from './middleware/autenticacion'; // Asegúrate de que la ruta es correcta
import Groq from 'groq-sdk';
import clientPromise from '../../lib/mongodb'; // Importa clientPromise

const router = createRouter();

// Inicializar el cliente de Groq con tu API Key
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 50000,
});

router
  .use(autenticacion)
  .post(async (req, res) => {
    try {
      const { messages, model } = req.body;

      if (!messages || !model) {
        return res.status(400).json({ mensaje: 'Faltan datos en la solicitud' });
      }

      console.log('Payload enviado a la API de Groq:', {
        messages,
        model,
      });

      // Realizar la solicitud a la API de Groq usando el SDK
      const chatCompletion = await groq.chat.completions.create({
        messages,
        model,
      });

      // Almacenar los datos en MongoDB
      const client = await clientPromise;
      const db = client.db('compost'); // Usa el nombre de la base de datos de la URI
      const collection = db.collection('datos'); // Reemplaza con el nombre de tu colección

      const resultado = await collection.insertOne({
        messages,
        model,
        respuesta: chatCompletion,
        fecha: new Date(),
      });

      console.log('Datos almacenados en MongoDB con ID:', resultado.insertedId);

      res.status(200).json({
        mensaje: 'Imagen procesada y datos almacenados correctamente',
        datos: chatCompletion,
      });
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      res.status(500).json({ mensaje: 'Error al procesar la imagen', detalles: error.message });
    }
  });

export default router.handler({
  onError: (err, req, res) => {
    console.error('Error en el endpoint /api/imagenes:', err);
    res.status(500).end(err.message);
  },
});

export const config = {
  api: {
    bodyParser: true,
  },
};
