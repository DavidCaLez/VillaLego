const PackLego = require('../Model/PackLegoModel');

exports.crearPackUnico = async (packData, transaction = null) => {
    const { nombre, descripcion, cantidad_total, kit_id } = packData;

    if (!kit_id || !nombre || !descripcion || cantidad_total <= 0) {
        throw new Error("Datos inválidos para crear el pack.");
    }

    await PackLego.create({
        nombre,
        descripcion,
        cantidad_total,
        kit_id
    }, { transaction });

    console.log(`✅ Pack "${nombre}" creado con ${cantidad_total} unidades para el kit ${kit_id}`);
};

