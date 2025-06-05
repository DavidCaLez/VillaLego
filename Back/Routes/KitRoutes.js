const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const { soloAlumnos } = require('../Middleware/Atenticador');



// 1) Define dónde y cómo guardar los ficheros
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Dependiendo del fieldname guarda en kits o manuals
        const base = path.join(__dirname, '../uploads');
        if (file.fieldname === 'archivo_pdf') {
            cb(null, path.join(base, 'kits'));
        } else if (file.fieldname === 'pack_manual') {
            cb(null, path.join(base, 'manuales'));
        } else {
            cb(new Error('Campo de fichero desconocido'), false);
        }
    },
    filename: (req, file, cb) => {
        // Genera nombre único
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 2) Filtro para aceptar solo PDFs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Solo se permiten PDFs'), false);
};


const upload = multer({ storage, fileFilter });               // memoria, sin guardar en disco
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
router.post('/crear', soloProfesores, upload.fields([
    { name: 'archivo_pdf', maxCount: 1 },
    { name: 'pack_manual', maxCount: 20 }
]), kitcontroller.crearKit);

// Editar datos de un kit existente (formulario y procesamiento)
router.get('/editarKit/:kitId', soloProfesores, kitcontroller.getEditarKit);
router.post('/editarKit/:kitId', soloProfesores, upload.fields([
    { name: 'archivo_pdf', maxCount: 1 },
    { name: 'pack_manual', maxCount: 20 }
]), kitcontroller.postEditarKit);

// Vista “editarKitLista” (HTML)
router.get('/editar-vista/:kitId', soloProfesores, kitcontroller.vistaEditarKitLista);

// Ruta para asignar kits a una actividad, nos da la vista
router.get('/asignarKits', soloProfesores, kitcontroller.vistaAsignarKits);

//devuelve el JSON de los kits para asignar a una historia de usuario
router.get('/api/kits', soloProfesores, kitcontroller.getKits);

// obtiene el kit asignado a un turno específico
router.get('/asignado/:turnoId', soloAlumnos, kitcontroller.obtenerKitAsignado);

router.get('/pdf-alumno/:id', soloAlumnos, kitcontroller.verPDF);

module.exports = router;
