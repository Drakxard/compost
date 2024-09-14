// pages/api/imagenes.js

import multer from 'multer';
import nc from 'next-connect';
import autenticacion from '../middleware/autenticacion';
import fetch from 'node-fetch';

const upload = multer({ storage: multer.memoryStorage() });

const handler = nc()
  .use(autenticacion)
  .use(upload.single('imagen'))
  .post(async (req, res) => {
    const imagen = req.file;
    if (!imagen) {
      return res.status(400).json({ mensaje: 'No se proporcionó ninguna imagen' });
    }

    try {
      // Enviar la imagen al endpoint /api/procesar-imagen
      const respuestaProcesada = await fetch('https://compost-six.vercel.app/api/procesar-imagen', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.API_KEY,
          'Content-Type': 'application/octet-stream',
        },
        body: imagen.buffer,
      });

      const datosProcesados = await respuestaProcesada.json();

      if (!respuestaProcesada.ok) {
        return res.status(respuestaProcesada.status).json(datosProcesados);
      }

      // Opcional: Almacenar datosProcesados en la base de datos
      // ...

      res.status(200).json({
        mensaje: 'Imagen procesada correctamente',
        datos: datosProcesados,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ mensaje: 'Error al procesar la imagen' });
    }
  });

export default handler;

export const config = {
  api: {
    bodyParser: false,
  },
};
