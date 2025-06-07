const express = require("express");
const router = express.Router();
const validarTurnos = require("../Middleware/validarTurnos");
const TurnoController = require("../Controller/Turnocontroller");
const { soloProfesores } = require("../Middleware/Atenticador");
const { soloAlumnos } = require("../Middleware/Atenticador");

//const { clientsPorTurno } = require("../app");

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


// muestra la vista de retrospectiva
router.get('/retrospectiva/vista/:turnoId', soloAlumnos, TurnoController.vistaRetrospectiva);


// Ruta para la vista de planificación
router.get(
  "/planificacion/:turnoId",
  soloAlumnos,
  TurnoController.vistaPlanificacion
);

router.get("/sprint/:turnoId", soloAlumnos, TurnoController.vistaSprint);

// Ruta para la vista de revisión
router.get('/revision/:turnoId', soloAlumnos, TurnoController.vistaRevision);

// Ruta para conectarse con Server-Sent Events (SSE)
router.get("/api/events/:turnoId", soloAlumnos, (req, res) => {
  const turnoId = req.params.turnoId;
  const clientsPorTurno = req.app.locals.clientsPorTurno;
  console.log(`[SSE] Conexión entrante para turno ${turnoId}`);

  // 1) Cabeceras SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  if (res.flushHeaders) res.flushHeaders();

  // 2) Aseguramos que exista el array para este turno
  if (!clientsPorTurno[turnoId]) {
    console.log(`[SSE] Creando nuevo array para turno ${turnoId}`);
    clientsPorTurno[turnoId] = [];
  }

  // 3) Guardamos la respuesta res para futuros eventos
  clientsPorTurno[turnoId].push(res);
  console.log(`[SSE] Clientes suscritos para turno ${turnoId}: ${clientsPorTurno[turnoId].length}`);

  // 4) Enviamos un comentario inicial para mantener viva la conexión
  res.write(`: conectado al stream de la fase del turno ${turnoId}\n\n`);

  // 5) Cuando el cliente cierra la conexión, lo removemos de la lista
  req.on("close", () => {
    console.log(`[SSE] Cliente desconectado del turno ${turnoId}`);
    const lista = clientsPorTurno[turnoId] || [];
    clientsPorTurno[turnoId] = lista.filter(r => r !== res);
  });
});

module.exports = router;
