const express = require('express');
const router = express.Router();
const profesorController = require('../Controller/ProfesorController');
const { soloPadmin } = require('../Middleware/Atenticador');
const { soloProfesores } = require('../Middleware/Atenticador');
router.get('/dashboardProfe', soloProfesores, profesorController.dashboardProfesor);
router.get('/dashboardAdmin', soloPadmin, profesorController.dashboard);
router.get('/Upgrade.html', soloPadmin, profesorController.getUpgrade);
router.post('/Upgrade.html', soloPadmin, profesorController.postUpgrade);

module.exports = router;
