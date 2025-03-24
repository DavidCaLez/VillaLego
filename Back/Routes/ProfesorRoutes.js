const express = require('express');
const router = express.Router();
const profesorController = require('../Controller/ProfesorController');
const { soloPadmin } = require('../Middleware/Atenticador');

router.get('/dashboard', soloPadmin, profesorController.dashboard);
router.get('/Upgrade.html', soloPadmin, profesorController.getUpgrade);
router.post('/Upgrade.html', soloPadmin, profesorController.postUpgrade);

module.exports = router;
