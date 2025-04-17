const express = require('express');
const router = express.Router();
const alumnoController = require('../Controller/AlumnoController');
const { soloAlumnos } = require('../Middleware/Atenticador');
const { soloProfesores } = require('../Middleware/Atenticador');

//router.get('/dashboard', soloAlumnos, alumnoController.dashboard);


router.get('/dashboard/:turnoId', soloAlumnos, alumnoController.vistaGrupos);
router.get('/api/grupos/:turnoId', soloAlumnos, alumnoController.obtenerGruposPorTurno);
router.post('/api/inscribir', soloAlumnos, alumnoController.inscribirGrupo);

module.exports = router;
