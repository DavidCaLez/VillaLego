const express = require('express');
const router = express.Router();
const ResultadoController = require('../Controller/ResultadoController');

router.post('/subir', ResultadoController.uploadMiddleware, ResultadoController.subirResultado);

module.exports = router;