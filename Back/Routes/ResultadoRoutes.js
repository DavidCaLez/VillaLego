const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { crearResultado } = require('../Controller/ResultadoController');

// Guardar en carpeta /uploads/resultados/
const storage = multer.diskStorage({
    destination: path.join(__dirname, '..', 'uploads', 'resultados'),
    filename: (_, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

router.post('/subir', upload.single('imagen'), crearResultado);

const os = require('os');

// Función para obtener IP local automáticamente
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                return config.address;
            }
        }
    }
    return 'localhost';
}

// Ruta que genera el formulario HTML con la IP dinámica
router.get('/formulario-subida', (req, res) => {
    const ip = getLocalIP();
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Subir Imagen</title>
    </head>
    <body>
      <h2>Subir imagen de resultado</h2>
      <form action="http://${ip}:3000/resultado/subir" method="POST" enctype="multipart/form-data">
        <input type="hidden" name="historia_usuario_id" value="1.2">
        <input type="file" name="imagen" accept="image/*" capture="environment" required>
        <button type="submit">Subir Imagen</button>
      </form>
    </body>
    </html>
  `);
});

module.exports = router;