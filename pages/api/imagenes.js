// pages/api/imagenes.js

import multer from 'multer';
import nextConnect from 'next-connect';
import autenticacion from './middleware/autenticacion';

const upload = multer({ storage: multer.memoryStorage() });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Error en el middleware: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Método ${req.method} no permitido` });
  },
});

apiRoute.use(autenticacion);
apiRoute.use(upload.single('imagen'));

apiRoute.post((req, res) => {
  const imagen = req.file;
  if (!imagen) {
    return res.status(400).json({ mensaje: 'No se proporcionó ninguna imagen' });
  }

  // Aquí podrías guardar la imagen temporalmente o pasarla al siguiente proceso

  res.status(200).json({ mensaje: 'Imagen recibida correctamente' });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // Deshabilita el bodyParser integrado de Next.js
  },
};
