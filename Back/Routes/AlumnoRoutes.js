const express = require('express');
const router = express.Router();
const alumnoController = require('../Controller/AlumnoController');
const { soloAlumnos } = require('../Middleware/Atenticador');

router.get('/Alumno.html', soloAlumnos, alumnoController.dashboard);

module.exports = router;
