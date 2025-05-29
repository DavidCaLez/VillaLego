const Backlog = require('../Model/BacklogModel');
const HistoriaUsuario = require('../Model/HistoriaUsuarioModel');

exports.guardarBacklog = async (req, res) => {
    const { historias, kitId, grupoId } = req.body;

    try {
        for (const { id, prioridad } of historias) {
            const original = await HistoriaUsuario.findByPk(id);
            if (!original) continue;

            await Backlog.upsert({
                id: id,
                titulo: original.titulo,
                descripcion: original.descripcion,
                size: original.size,
                priority: prioridad, // ← ahora texto directamente
                kit_id: kitId,
                grupo_id: grupoId
            });
        }
        res.status(200).json({ mensaje: 'Backlog actualizado' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error guardando backlog' });
    }
};