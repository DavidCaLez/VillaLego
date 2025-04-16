const express = require("express");
const router = express.Router();
const usuarioController = require("../Controller/UsuarioController");

// Sirve para iniciar sesión
router.get("/login", usuarioController.getLogin);
router.post("/login", usuarioController.postLogin);

// Ruta para el registro de usuarios (alumnos y profesores)
router.get("/register", usuarioController.getRegister);
router.post("/register", usuarioController.postRegister);


// Sirve para cerrar sesión
router.get("/logout", usuarioController.logout);

// Obtener la primera letra del correo
router.get('/inicial', usuarioController.obtenerInicial);

module.exports = router;
