const express = require('express');
const router = express.Router();
const BacklogController = require('../Controller/BacklogController');

// Ruta para guardar backlog, individual por grupo id
router.post('/guardar', BacklogController.guardarBacklog);
router.get('/api/historias/:grupoId', BacklogController.getHistoriasPorGrupo);

// Ruta para guardar retrospectiva
router.post('/retrospectiva', BacklogController.guardarRetrospectiva);

// actualizar con info de planificaciÃ³n
router.put('/api/actualizarBacklog', BacklogController.actualizarHistoria);
router.put('/validar', BacklogController.validarHistoria);

module.exports = router;