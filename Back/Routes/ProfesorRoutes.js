const express = require('express');
const router = express.Router();
const profesorController = require('../Controller/ProfesorController');
const { soloPadmin } = require('../Middleware/Atenticador');
const { soloProfesores } = require('../Middleware/Atenticador');

//Relacionado con Profesor
router.get('/dashboardProfe', soloProfesores, profesorController.dashboardProfesor);
router.get('/dashboardAdmin', soloPadmin, profesorController.dashboard);
router.get('/Upgrade.html', soloPadmin, profesorController.getUpgrade);
router.post('/Upgrade.html', soloPadmin, profesorController.postUpgrade);

//Relacionado con Actividad
router.get('/crear', soloProfesores, profesorController.vistaCrear);
router.post('/editar/:id', soloProfesores, profesorController.editarActividad);
router.get('/:id', soloProfesores, profesorController.obtenerActividad);

module.exports = router;
