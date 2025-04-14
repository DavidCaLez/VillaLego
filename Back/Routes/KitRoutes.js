const express = require('express');
const router = express.Router();
const kitcontroller = require('../Controller/KitController');
const { soloProfesores } = require('../Middleware/Atenticador');


router.get('/listarKits', soloProfesores, kitcontroller.listarKits);
router.get('/pdf/:id', soloProfesores, kitcontroller.verPDF);


// Vista HTML
router.get('/verkits/:actividadId', soloProfesores, kitcontroller.vistaKitsDeActividad);

// API JSON
router.get('/api/kits-asignados/:actividadId', soloProfesores, kitcontroller.obtenerKitsDeActividad);

// Ruta para mostrar la vista de edición de kits (necesitarás crear el archivo editarKits.html)
router.get('/editar/:actividadId', soloProfesores, kitcontroller.vistaEditarKits);

// Ruta para procesar la edición de kits
router.post('/editar/:actividadId', soloProfesores, require('../Controller/KitController').editarKits);

// Ruta para asignar kits a una actividad, nos da la vista
router.get('/asignarKits', soloProfesores, kitcontroller.vistaAsignarKits);


module.exports = router;