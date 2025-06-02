const express = require("express");
const router = express.Router();
const validarTurnos = require("../Middleware/validarTurnos");
const TurnoController = require("../Controller/Turnocontroller");
const { soloProfesores } = require("../Middleware/Atenticador");
const { soloAlumnos } = require("../Middleware/Atenticador");

// Ruta para crear turnos con validación previa
router.post(
  "/crear",
  validarTurnos,
  soloProfesores,
  TurnoController.crearTurno
);
router.get("/turnos", soloProfesores, TurnoController.vistaTurnos);

// Ver turnos en HTML
router.get("/ver/:actividadId", soloProfesores, TurnoController.vistaVerTurnos);

// Obtener turnos en formato JSON
router.get(
  "/api/:actividadId",
  soloProfesores,
  TurnoController.obtenerTurnosPorActividad
);

// Editar turnos de una actividad(POST y GET)
router.post(
  "/editar/:actividadId",
  soloProfesores,
  TurnoController.editarTurno
);
router.get(
  "/editar/:actividadId",
  soloProfesores,
  TurnoController.vistaEditarTurno
);

// Devuelve el JSON de los turnos para asignar a una historia de usuario
router.get("/api/lista", soloProfesores, (req, res) => {
  res.json(req.session.turnos || []);
});
router.get("/fase/:turnoId", soloProfesores, TurnoController.obtenerFaseTurno);
router.get(
  "/instrucciones/:turnoId",
  soloAlumnos,
  TurnoController.vistaInstrucciones
);

// fase de priorización
router.get(
  "/priorizacion/:turnoId",
  soloAlumnos,
  TurnoController.vistaPriorizacion
);
// API para saber rol + kit de este usuario/turno
router.get("/rol/:turnoId", soloAlumnos, TurnoController.obtenerRolYKit);

router.get(
  "/api/faseTurno/:turnoId",
  soloProfesores,
  TurnoController.obtenerFaseTurno
);
router.get(
  "/comprobacion/:turnoId",
  soloProfesores,
  TurnoController.vistaComprobacion
);
router.put(
  "/api/cambiarFase/:turnoId",
  soloProfesores,
  TurnoController.cambiarFaseTurno
);
router.get("/iniciar", soloProfesores, TurnoController.iniciarTurno);

// Ruta para la vista de planificación
router.get(
  "/planificacion/:turnoId",
  soloAlumnos,
  TurnoController.vistaPlanificacion
);
router.get("/sprint/:turnoId", soloAlumnos, TurnoController.vistaSprint);

module.exports = router;
