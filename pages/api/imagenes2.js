// pages/api/imagenes2.js
import { createRouter } from 'next-connect';

const router = createRouter();

router
  .get((req, res) => {
    // Envía una respuesta básica
    res.status(200).json({ mensaje: 'Prueba exitosa' });
  });

// Exporta el router handler como la exportación por defecto
export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).end(err.message);
  },
});
