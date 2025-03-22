const express = require('express');
const router = express.Router();
const profesorController = require('../Controller/ProfesorController');
const { soloHazmin } = require('../Middleware/Atenticador');

router.get('/dashboard', soloHazmin, profesorController.dashboard);
router.get('/upgrade', soloHazmin, profesorController.getUpgrade);
router.post('/upgrade', soloHazmin, profesorController.postUpgrade);

module.exports = router;
