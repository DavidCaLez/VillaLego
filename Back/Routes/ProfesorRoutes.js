const express = require('express');
const path = require('path');
const router = express.Router();
const profesorController = require('../Controllers/ProfesorController');
const { soloHazmin } = require('../middlewares/auth');

router.get('/Profesor', soloHazmin, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/profesor/dashboard.html'));
});

router.get('/upgrade', soloHazmin, profesorController.getUpgrade);
router.post('/upgrade', soloHazmin, profesorController.postUpgrade);

module.exports = router;
