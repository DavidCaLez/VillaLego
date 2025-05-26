const express = require('express');
const router = express.Router();
const packLegoController = require('../Controller/PackLegoController'); 

// Obtiene los manuales de un kit específico
router.get('/api/manuales/:kitId', packLegoController.obtenerManualesPorKit);

module.exports=router