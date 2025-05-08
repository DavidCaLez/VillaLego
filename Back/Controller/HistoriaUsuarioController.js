const path = require('path');
const fs = require('fs');
const HistoriaUsuario = require('../Model/HistoriaUsuarioModel');
const { v4: uuidv4 } = require('uuid');

// Vista HTML
exports.vistaHistoriasUsuario = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/HistoriasUsuario.html'));
};

// Obtener todas
exports.getHistoriasUsuario = async (req, res) => {
    const historias = await HistoriaUsuario.findAll();
    res.json(historias);
};

exports.vistaCrearHistoriaUsuario = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/HistoriaUsuario.html'));
};

exports.crearHistoriaUsuario = async (req, res) => {
    try {
        const { titulo, descripcion, kit_id } = req.body;
        // Fallback si no vino imagen
        const id = req.historiaId || uuidv4();
        let imagen = null, size = null;

        if (req.file) {
            imagen = req.file.filename;
            size = req.file.size;
        }

        await HistoriaUsuario.create({
            id, titulo, descripcion, imagen, size, kit_id
        });

        return res.redirect('/historia-usuario/vista');
    } catch (err) {
        console.error('🔴 Error al crear historia:', err);
        return res.status(500).send(err.message); // en dev muestra el mensaje
    }
};

// Preload desde archivo
exports.preloadHistoriasUsuario = async () => {
    const preloadPath = path.join(__dirname, '../preload/historias.json');

    if (!fs.existsSync(preloadPath)) {
        console.warn("⚠️ Archivo preload no encontrado:", preloadPath);
        return;
    }

    const historias = JSON.parse(fs.readFileSync(preloadPath, 'utf-8'));

    for (const historia of historias) {
        const [registro, creado] = await HistoriaUsuario.findOrCreate({
            where: { id: historia.id },
            defaults: historia
        });

        if (creado) {
            console.log(`✅ Historia ${historia.id} cargada.`);
        } else {
            console.log(`ℹ️ Historia ${historia.id} ya existía.`);
        }
    }
};
