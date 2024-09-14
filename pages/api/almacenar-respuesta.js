// pages/api/almacenar-respuesta.js

import nextConnect from 'next-connect';
import autenticacion from './middleware/autenticacion';
import clientPromise from '../../utils/db';

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Error en el middleware: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Método ${req.method} no permitido desde almacenar-respuesta.js` });
  },
});

apiRoute.use(autenticacion);

apiRoute.post(async (req, res) => {
  const datosProcesados = req.body;
  if (!datosProcesados) {
    return res.status(400).json({ mensaje: 'No se proporcionaron datos para almacenar' });
  }

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const coleccion = db.collection('respuestas');

    await coleccion.insertOne(datosProcesados);

    res.status(200).json({ mensaje: 'Respuesta almacenada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al almacenar la respuesta en la base de datos' });
  }
});

export default apiRoute;
