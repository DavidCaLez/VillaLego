const path = require('path');
const HistoriaUsuario = require('../Model/HistoriaUsuarioModel');
const Backlog = require('../Model/BacklogModel');

exports.getHistoriasPorGrupo = async (req, res) => {
    try {
        const grupoId = req.params.grupoId;
        
        const historias = await Backlog.findAll({
            where: { grupo_id: grupoId },
            order: [['priority', 'DESC']]
        });

        res.json(historias);
    } catch (err) {
        console.error('Error al obtener historias:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

exports.guardarObjetivo = async (req, res) => {
    try {
        const grupoId = req.params.grupoId;
        const { objetivo } = req.body;

        await Backlog.create({
            grupo_id: grupoId,
            objetivo: objetivo
        });

        res.json({ mensaje: 'Objetivo guardado correctamente' });
    } catch (err) {
        console.error('Error al guardar objetivo:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

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