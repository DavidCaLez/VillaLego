const path = require('path');
const fs = require('fs');
const HistoriaUsuario = require('../Model/HistoriaUsuarioModel');
const { v4: uuidv4 } = require('uuid');

// Vista HTML
exports.vistaHistoriasUsuario = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/ListaHistoriasUsuario.html'));
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
        // 1) Sacamos todos los IDs actuales para este kit
        const rows = await HistoriaUsuario.findAll({
            where: { kit_id },
            attributes: ['id']
        });
        // 2) Extraemos la parte numérica tras el punto
        const secuencias = rows.map(r => {
            const parts = r.id.split('.');
            return parts[0] === kit_id.toString() && parts[1]
                ? parseInt(parts[1], 10)
                : 0;
        });
        const nextSeq = secuencias.length
            ? Math.max(...secuencias) + 1
            : 1;
        const newId = `${kit_id}.${nextSeq}`;      // ej. "2.9"

        let imagenNombre = null;
        if (req.file) {
            // 3) Extensión original
            const ext = path.extname(req.file.originalname);
            // 4) Nuevo nombre, usando punto o guión bajo como prefieras:
            imagenNombre = `${kit_id}_${newId}${ext}`; // ej. "2_2.9.png"
            // 5) Rutas absolutas
            const oldPath = req.file.path;             // uploads/historias_usuario/abc123
            const newPath = path.join(path.dirname(oldPath), imagenNombre);
            // 6) Renombrar el fichero en disco
            await fs.promises.rename(oldPath, newPath);
        }

        // 7) Crear la fila en BD
        await HistoriaUsuario.create({
            id: newId,
            titulo,
            descripcion,
            imagen: imagenNombre,  // o null si no hay imagen
            kit_id
        });

        res.redirect('/historia-usuario/vista');
    } catch (err) {
        console.error('Error creando historia de usuario:', err);
        res.status(500).send(err.message);
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
