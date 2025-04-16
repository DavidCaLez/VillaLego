const express = require('express');
const router = express.Router();
const kitcontroller = require('../Controller/KitController');
const { soloProfesores } = require('../Middleware/Atenticador');
const multer = require('multer');

const upload = multer(); // Utiliza memoria, no guarda archivos en disco

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

// Creación de kits
router.get('/crear',soloProfesores, kitcontroller.vistaCrearKit);
router.post('/crear',soloProfesores, upload.single('archivo_pdf'), kitcontroller.crearKit);

// ver los kits que existen en la base de datos
router.get('/listaKits', soloProfesores, kitcontroller.vistaListadoKitsEditar);



module.exports = router;