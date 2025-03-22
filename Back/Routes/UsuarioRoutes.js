const express = require('express');
const path = require('path');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// Mostrar formularios
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

// Acciones
router.post('/login', usuarioController.postLogin);
router.post('/register', usuarioController.postRegister);
router.get('/logout', usuarioController.logout);

module.exports = router;