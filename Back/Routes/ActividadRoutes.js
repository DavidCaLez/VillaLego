const express = require('express');
const router = express.Router();
const actividadController = require('../Controller/ActividadController');
const { soloProfesores } = require('../Middleware/Atenticador');

router.get('/crear', soloProfesores, actividadController.vistaCrear);
router.post('/crear', soloProfesores, actividadController.crearActividad);

router.get('/lista', soloProfesores, actividadController.getActividades);
router.get('/verActividad/:id', soloProfesores, actividadController.verActividad);
router.get('/:id', soloProfesores, actividadController.obtenerActividad);

// Relacionado con la asignación de kits
router.post('/crearActividadCompleta', soloProfesores, actividadController.crearActividadCompleta);
// Rutas de la edición de las actividades
router.get('/editar/:id', soloProfesores, actividadController.vistaEditar);
router.post('/editar/:id', soloProfesores, actividadController.editarActividad);


module.exports = router;