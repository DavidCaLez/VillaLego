const express = require('express');
const router = express.Router();
const alumnoController = require('../Controller/AlumnoController');
const { soloAlumnos } = require('../Middleware/Atenticador');
const { soloProfesores } = require('../Middleware/Atenticador');

router.get('/dashboard', soloAlumnos, alumnoController.dashboard);


module.exports = router;
