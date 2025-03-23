const express = require('express');
const router = express.Router();
const usuarioController = require('../Controller/UsuarioController');

router.get('/login.html', usuarioController.getLogin);
router.post('/login.html', usuarioController.postLogin);

router.get('/register.html', usuarioController.getRegister);
router.post('/register.html', usuarioController.postRegister);

router.get('/logout', usuarioController.logout);

module.exports = router;

