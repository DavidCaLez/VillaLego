// Controller/ResultadoController.js
const multer = require("multer");
const path = require("path");
const Resultado = require("../Model/ResultadoModel");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../uploads/resultados"));
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

exports.uploadMiddleware = upload.single("imagen");

exports.subirResultado = async (req, res) => {
    try {
        const { backlogId } = req.body;
        if (!backlogId || !req.file) {
            return res.status(400).json({ error: "Faltan datos o imagen" });
        }

        const existingResultado = await Resultado.findOne({ where: { backlog: backlogId } });

        if (existingResultado) {
            // Delete old image if it exists
            if (existingResultado.imagen) {
                const oldImagePath = path.join(__dirname, '..', existingResultado.imagen);
                require('fs').unlink(oldImagePath, (err) => {
                    if (err) console.error('Error deleting old image:', err);
                });
            }
            // Update existing resultado
            existingResultado.imagen = `/uploads/resultados/${req.file.filename}`;
            nuevoResultado = await existingResultado.save();
        } else {
            // Create new resultado
            nuevoResultado = await Resultado.create({
                backlog: backlogId,
                imagen: `/uploads/resultados/${req.file.filename}`
            });
        }

        res.json({ mensaje: "✅ Imagen subida", resultado: nuevoResultado });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar resultado" });
    }
};

exports.obtenerResultado = async (req, res) => {
    try {
        const { backlogId } = req.params;
        if (!backlogId) {
            return res.status(400).json({ error: "Falta backlogId en parámetros." });
        }

        // Buscar en la tabla
        const resultado = await Resultado.findOne({
            where: { backlog: backlogId }
        });

        if (!resultado || !resultado.imagen) {
            return res.status(404).json({ error: "No se encontró imagen para esta historia." });
        }

        // Devolver la ruta de la imagen
        return res.json({ imagen: resultado.imagen });
    } catch (err) {
        console.error("Error en obtenerResultado:", err);
        return res.status(500).json({ error: "Error interno al buscar imagen." });
    }
};