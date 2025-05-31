const Backlog = require('../Model/BacklogModel');
const HistoriaUsuario = require('../Model/HistoriaUsuarioModel');

exports.guardarBacklog = async (req, res) => {
    const { historias, kitId, grupoId } = req.body;

    try {
        for (const { id, prioridad } of historias) {
            const original = await HistoriaUsuario.findByPk(id);
            if (!original) continue;

            await Backlog.upsert({
                //id: id,
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

exports.guardarRetrospectiva = async (req, res) => {
    try {
        const { queFueBien, queNoFueBien, mejoras, grupoId, alumnoId, kit_id,esMejora } = req.body;

        if (!grupoId || !alumnoId) {
            return res.status(400).json({ error: "Faltan grupoId o alumnoId" });
        }

        const respuestasConcatenadas = `${queFueBien};${queNoFueBien};${mejoras}`;
        const tituloRetrospectiva = `retrospectiva_${grupoId}`;

        // -------- VERIFICACIÓN DE DUPLICADO (opcional, comentada) --------
        /*
        const yaExiste = await Backlog.findOne({
          where: { titulo: tituloRetrospectiva, grupo_id: grupoId }
        });
        if (yaExiste) {
          return res.status(409).json({ error: "Ya existe una retrospectiva para este grupo." });
        }
        */
        // ----------------------------------------------------------

        await Backlog.create({
            titulo: tituloRetrospectiva,
            descripcion: respuestasConcatenadas,
            esMejora: !! esMejora,
            completado: true,
            alumno_id: alumnoId,
            grupo_id: grupoId,
            kit_id: kit_id
        });

        return res.json({ mensaje: "✅ Retrospectiva registrada correctamente." });
    } catch (err) {
        console.error("❌ Error al guardar retrospectiva:", err);
        return res.status(500).json({ error: "Error al guardar retrospectiva." });
    }
};