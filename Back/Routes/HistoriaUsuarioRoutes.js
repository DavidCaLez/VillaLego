const express = require('express');
const path = require('path');
const multer = require('multer');
const HistoriaUsuario = require('../Model/HistoriaUsuarioModel');
const { v4: uuidv4 } = require('uuid');
const { soloProfesores } = require('../Middleware/Atenticador');
const HistoriaUsuarioController = require('../Controller/HistoriaUsuarioController');

const router = express.Router();
// Apuntamos a la carpeta real dentro de Back
const uploadDir = path.resolve(__dirname, '../uploads/historias_usuario');
console.log('→ Multer guardará imágenes en:', uploadDir);


const upload = multer({
    dest: uploadDir,
});

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

// Vista de edición
router.get(
  '/editar',
  soloProfesores,
  HistoriaUsuarioController.vistaEditarHistoriaUsuario
);
// Procesar edición (incluida nueva imagen si llega)
router.post(
    '/editar',
    soloProfesores,
    upload.single('imagen'),
    HistoriaUsuarioController.editarHistoriaUsuario
);

module.exports = router;