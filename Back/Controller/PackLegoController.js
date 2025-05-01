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

