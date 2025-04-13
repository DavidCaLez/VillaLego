const express = require('express');
const router = express.Router();
const HistoriaUsuarioController = require('../Controller/HistoriaUsuarioController');
const { soloProfesores } = require('../Middleware/Atenticador');

// Rutas para la gestión de historias de usuario
//router.get('/crear', soloProfesores, HistoriaUsuarioController.vistaCrearHistoriaUsuario);
//router.post('/crear', soloProfesores, HistoriaUsuarioController.crearHistoriaUsuario);
router.get('/', HistoriaUsuarioController.getHistoriasUsuario);
router.get('/vista', HistoriaUsuarioController.vistaHistoriasUsuario);

module.exports = router;