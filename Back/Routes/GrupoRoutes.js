const express = require('express');
const router = express.Router();
const GrupoController = require('../Controller/GrupoController');
const { soloProfesores } = require('../Middleware/Atenticador');

// Ruta para obtener grupos con roles de un turno específico
router.get('/datos/:turnoId', soloProfesores, GrupoController.obtenerGruposConRoles);

// Ruta que nos devuelve la vista de grupos
router.get('/vista', soloProfesores, GrupoController.vistaGrupos);

module.exports = router;