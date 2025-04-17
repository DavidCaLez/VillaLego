const express = require('express');
const router = express.Router();
const profesorController = require('../Controller/ProfesorController');
const { soloProfesores } = require('../Middleware/Atenticador');

//Relacionado con Profesor
router.get('/dashboard', soloProfesores, profesorController.dashboard);
router.get('/CrearProfesor', soloProfesores, profesorController.getCrearProfesor);
router.post('/CrearProfesor', soloProfesores, profesorController.postCrearProfesor);

// Relacionado con Perfil
//router.get('/perfil', soloProfesores, profesorController.obtenerPerfil);
//router.get('/verPerfil', soloProfesores, profesorController.vistaPerfil);

module.exports = router; 

