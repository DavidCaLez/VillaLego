const express = require('express');
const router = express.Router();
const profesorController = require('../Controller/ProfesorController');
const { soloProfesores } = require('../Middleware/Atenticador');

//Relacionado con Profesor
router.get('/dashboard', soloProfesores, profesorController.dashboard);
router.get('/Upgrade.html', soloProfesores, profesorController.getUpgrade);
router.post('/Upgrade.html', soloProfesores, profesorController.postUpgrade);

// Relacionado con Perfil
router.get('/perfil', soloProfesores, profesorController.obtenerPerfil);
router.get('/verPerfil', soloProfesores, profesorController.vistaPerfil);

//Relacionado con Actividad
router.get('/crear', soloProfesores, profesorController.vistaCrear);
router.post('/editar/:id', soloProfesores, profesorController.editarActividad);
router.get('/:id', soloProfesores, profesorController.verActividad);//muestra el html correspondiente para poder ver la información de la actividad
router.get('/api/:id', soloProfesores, profesorController.obtenerActividad);// Obtiene el json de una actividad

module.exports = router 

