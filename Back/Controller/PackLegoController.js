const PackLego = require('../Model/PackLegoModel');

exports.crearPackUnico = async (packData, transaction = null) => {
    const { codigo, descripcion, cantidad_total, kit_id } = packData;

    if (!kit_id || !codigo || !descripcion || cantidad_total <= 0) {
        throw new Error("Datos inválidos para crear el pack.");
    }

    await PackLego.create({
        codigo,
        descripcion,
        cantidad_total,
        kit_id
    }, { transaction });

    console.log(`✅ Pack "${codigo}" creado con ${cantidad_total} unidades para el kit ${kit_id}`);
};

exports.obtenerManualesPorKit = async (req, res) => {
    const kitId = req.params.kitId;

    try {
        const packs = await PackLego.findAll({
            where: { kit_id: kitId },
            attributes: ['descripcion', 'manual_pdf']
        });

        if (!packs.length) {
            return res.status(404).json({ error: 'No hay manuales para este kit' });
        }

        const manuales = packs.map(p => ({
            nombre: p.descripcion,
            url: `/uploads/manuales/${p.manual_pdf}`
        }));

        res.json(manuales);
    } catch (err) {
        console.error('❌ Error obteniendo manuales:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

