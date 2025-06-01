const express = require('express');
const router = express.Router();
const BacklogController = require('../Controller/BacklogController');

router.post('/guardar', BacklogController.guardarBacklog);
router.get('/api/historias/:grupoId', BacklogController.getHistoriasPorGrupo);
router.post('/api/objetivo/:grupoId', BacklogController.guardarObjetivo);

module.exports = router;