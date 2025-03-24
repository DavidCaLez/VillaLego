const express = require('express');
const router = express.Router();
const profesorController = require('../Controller/ProfesorController');
const { soloHazmin } = require('../Middleware/Atenticador');

router.get('/dashboard', soloHazmin, profesorController.dashboard);
router.get('/Upgrade.html', soloHazmin, profesorController.getUpgrade);
router.post('/Upgrade.html', soloHazmin, profesorController.postUpgrade);

module.exports = router;
