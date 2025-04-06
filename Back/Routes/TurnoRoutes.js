const express = require('express');
const router = express.Router();
const validarTurnos = require('../Middleware/validarTurnos');
const TurnoController = require('../Controller/TurnoController');
const {soloProfesores} = require('../Middleware/Atenticador');

// Ruta para crear turnos con validación previa
router.post('/crear', validarTurnos, soloProfesores,TurnoController.crearTurno);
router.get('/turnos', soloProfesores,TurnoController.vistaTurnos);

module.exports = router;

