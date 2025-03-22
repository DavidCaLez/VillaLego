const express = require('express');
const path = require('path');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController');
const { soloAlumnos } = require('../middlewares/auth');

router.get('/Alumno', soloAlumnos, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/alumno/dashboard.html'));
});

module.exports = router;
