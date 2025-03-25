const express = require('express');
const router = express.Router();
const actividadController = require('../Controller/ActividadController');
const { soloProfesores } = require('../Middleware/Atenticador');

router.get('/dashboard', soloProfesores, actividadController.vistaDashboard);
router.get('/crear', soloProfesores, actividadController.vistaCrear);
router.post('/crear', soloProfesores, actividadController.crearActividad);

router.get('/lista', soloProfesores, actividadController.getActividades);
router.get('/:id', soloProfesores, actividadController.obtenerActividad);
router.post('/editar/:id', soloProfesores, actividadController.editarActividad);

module.exports = router;