const express = require('express');
const router = express.Router();
const BacklogController = require('../Controller/BacklogController');

// Ruta para guardar backlog, individual por grupo id
router.post('/guardar', BacklogController.guardarBacklog);

// Ruta para guardar retrospectiva
router.post('/retrospectiva', BacklogController.guardarRetrospectiva);

module.exports = router;