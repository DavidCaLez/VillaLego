const express = require('express');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { soloProfesores } = require('../Middleware/Atenticador');
const HistoriaUsuarioController = require('../Controller/HistoriaUsuarioController');

const router = express.Router();
const uploadDir = path.join(__dirname, '../../uploads/historias_usuario');

const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        // Genera el ID antes de guardar
        const historiaId = uuidv4();
        req.historiaId = historiaId;
        const kitId = req.body.kit_id || 'sinKit';
        const ext = path.extname(file.originalname);
        cb(null, `${kitId}_${historiaId}${ext}`);
    }
});
const upload = multer({ storage });

// Mostrar formulario
router.get('/crear', soloProfesores, HistoriaUsuarioController.vistaCrearHistoriaUsuario);

// Procesar formulario + imagen
router.post(
    '/crear',
    soloProfesores,
    upload.single('imagen'),
    HistoriaUsuarioController.crearHistoriaUsuario
);

// Rutas para la gestión de historias de usuario
//router.get('/crear', soloProfesores, HistoriaUsuarioController.vistaCrearHistoriaUsuario);
//router.post('/crear', soloProfesores, HistoriaUsuarioController.crearHistoriaUsuario);
router.get('/', HistoriaUsuarioController.getHistoriasUsuario);
router.get('/vista', HistoriaUsuarioController.vistaHistoriasUsuario);

module.exports = router;