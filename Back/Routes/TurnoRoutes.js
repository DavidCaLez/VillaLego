const express = require('express');
const router = express.Router();
const validarTurnos = require('../Middleware/validarTurnos');
const TurnoController = require('../Controller/Turnocontroller');
const {soloProfesores} = require('../Middleware/Atenticador');

// Ruta para crear turnos con validación previa
router.post('/crear', validarTurnos, soloProfesores,TurnoController.crearTurno);
router.get('/turnos', soloProfesores,TurnoController.vistaTurnos);

// Ver turnos en HTML
router.get('/ver/:actividadId', soloProfesores, TurnoController.vistaVerTurnos);

// Obtener turnos en formato JSON
router.get('/api/:actividadId', soloProfesores, TurnoController.obtenerTurnosPorActividad);

// Editar turnos de una actividad(POST y GET)
router.post('/editar/:actividadId', soloProfesores, TurnoController.editarTurno);
router.get('/editar/:actividadId', soloProfesores, TurnoController.vistaEditarTurno);



module.exports = router;

