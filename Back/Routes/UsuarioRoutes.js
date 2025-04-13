const express = require("express");
const router = express.Router();
const usuarioController = require("../Controller/UsuarioController");

router.get("/login", usuarioController.getLogin);
router.post("/login", usuarioController.postLogin);

router.get("/register", usuarioController.getRegister);
router.post("/register", usuarioController.postRegister);

router.get("/logout", usuarioController.logout);

module.exports = router;
