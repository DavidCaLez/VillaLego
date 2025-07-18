const express = require('express');
const router = express.Router();
const alumnoController = require('../Controller/AlumnoController');
const { soloAlumnos } = require('../Middleware/Atenticador');
const { soloProfesores } = require('../Middleware/Atenticador');

//router.get('/dashboard', soloAlumnos, alumnoController.dashboard);


router.get('/dashboard/:actividadId/:token', soloAlumnos, alumnoController.vistaTurnos);
router.get('/api/grupo/:turnoId', soloAlumnos, alumnoController.obtenerGruposPorTurno);
router.get('/api/grupos/:actividadId/:turnoId/:token', soloAlumnos, alumnoController.obtenerGruposDelTurno);
// inscribe al alumno en el grupo seleccionado
router.post('/api/inscribir', soloAlumnos, alumnoController.inscribirAlumnoConRol);
// obtiene los roles disponibles para el grupo seleccionado
router.get('/api/roles', soloAlumnos, alumnoController.obtenerRolesDisponibles);
// obtiene el grupo actual del alumno
router.get('/api/grupo-actual', soloAlumnos, alumnoController.obtenerGrupoActual);
// obtiene el estado de los grupos del turno seleccionado, es decir, los grupos y su estado (inscritos, tamaño, etc.)
router.get('/api/grupos/:turnoId', soloAlumnos, alumnoController.obtenerEstadoGrupos);
router.get('/dashboard/principal', soloAlumnos, alumnoController.vistaAlumno);
//router.get('/inicial', soloAlumnos, alumnoController.inicial);
router.get('/api/mis-turnos', soloAlumnos, alumnoController.misTurnos);
router.get('/turno/iniciar/:turnoId', soloAlumnos, alumnoController.iniciarTurno);
router .get('/api/rolTurno/:turnoId', soloAlumnos, alumnoController.obtenerRolTurno);
router.get('/api/alumnoId', soloAlumnos, alumnoController.obtenerAlumnoId);

module.exports = router;
