const express = require('express');
const router = express.Router();
const SprintController = require('../Controller/SprintController');
const { soloAlumnos } = require('../Middleware/Atenticador');

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "Back/uploads/resultados");
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
        cb(null, unique);
    }
});

const upload = multer({ storage });

router.post("/subirBurndown/:grupoId", upload.single("imagen"), SprintController.subirBurndown);

router.post('/api/sprint/:grupoId', soloAlumnos, SprintController.crearSprint);

module.exports = router;