const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();               // memoria, sin guardar en disco
const kitcontroller = require('../Controller/KitController');
const { soloProfesores } = require('../Middleware/Atenticador');

// Listar todos los kits (JSON)
router.get('/listarKits', soloProfesores, kitcontroller.listarKits);

// Ver PDF de un kit
router.get('/pdf/:id', soloProfesores, kitcontroller.verPDF);

// Ver kits de una actividad (HTML)
router.get('/verkits/:actividadId', soloProfesores, kitcontroller.vistaKitsDeActividad);

// Obtener kits asignados a una actividad (JSON)
router.get('/api/kits-asignados/:actividadId', soloProfesores, kitcontroller.obtenerKitsDeActividad);

// Vista para editar asignaciones de kits
router.get('/editar/:actividadId', soloProfesores, kitcontroller.vistaEditarKits);

// Procesar edición de asignaciones de kits
router.post('/editar/:actividadId', soloProfesores, kitcontroller.editarKits);

// Vista de la lista de todos los kits (HTML)
router.get('/listaKits', soloProfesores, kitcontroller.vistaListadoKitsEditar);

// Crear un nuevo kit (formulario y procesamiento)
router.get('/crear', soloProfesores, kitcontroller.vistaCrearKit);
router.post('/crear', soloProfesores, upload.single('archivo_pdf'), kitcontroller.crearKit);

// Editar datos de un kit existente (formulario y procesamiento)
router.get('/editarKit/:kitId', soloProfesores, kitcontroller.getEditarKit);
router.post('/editarKit/:kitId', soloProfesores, upload.single('archivo_pdf'), kitcontroller.postEditarKit);

// Vista “editarKitLista” (HTML)
router.get('/editar-vista/:kitId', soloProfesores, kitcontroller.vistaEditarKitLista);

// Ruta para asignar kits a una actividad, nos da la vista
router.get('/asignarKits', soloProfesores, kitcontroller.vistaAsignarKits);

module.exports = router;
