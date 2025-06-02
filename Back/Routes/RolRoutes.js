const express = require('express');
const router = express.Router();
const RolController = require('../Controller/RolController');
const { soloAlumnos } = require('../Middleware/Atenticador');

// Ruta para obtener desarrolladores de un grupo
router.get('/api/desarrolladores/:grupoId', soloAlumnos, RolController.obtenerDesarrolladores);

module.exports = router;