const path = require('path');
const fs = require('fs');
const HistoriaUsuario = require('../Model/HistoriaUsuarioModel');

// Vista HTML
exports.vistaHistoriasUsuario = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/HistoriasUsuario.html'));
};

// Obtener todas
exports.getHistoriasUsuario = async (req, res) => {
    const historias = await HistoriaUsuario.findAll();
    res.json(historias);
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
