const express = require('express');
const router = express.Router();
const SprintController = require('../Controller/SprintController');
const { soloAlumnos } = require('../Middleware/Atenticador');

router.post('/api/sprint/:grupoId', soloAlumnos, SprintController.crearSprint);

router.post('/subirBurndown/:grupoId', SprintController.subirBurndown);

module.exports = router;