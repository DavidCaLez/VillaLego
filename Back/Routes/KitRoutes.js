const express = require('express');
const router = express.Router();
const kitcontroller = require('../Controller/KitController');
const { soloProfesores } = require('../Middleware/Atenticador');

router.get('/crearkit', soloProfesores, kitcontroller.vistaCrear);
router.post('/crearkit', soloProfesores, kitcontroller.crearKit);

router.get('/listarKits', soloProfesores, kitcontroller.listarKits);
router.get('/pdf/:id', soloProfesores, kitcontroller.verPDF);


// Vista HTML
router.get('/verkits/:actividadId', soloProfesores, kitcontroller.vistaKitsDeActividad);

// API JSON
router.get('/api/kits-asignados/:actividadId', soloProfesores, kitcontroller.obtenerKitsDeActividad);

module.exports = router;