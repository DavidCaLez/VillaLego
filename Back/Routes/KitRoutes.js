const express = require('express');
const router = express.Router();
const kitcontroller = require('../Controller/KitController');
const { soloProfesores } = require('../Middleware/Atenticador');

router.get('/crearkit', soloProfesores, kitcontroller.vistaCrear);
router.post('/crearkit', soloProfesores, kitcontroller.crearKit);

router.get('/listarKits', soloProfesores, kitcontroller.listarKits);

module.exports = router;