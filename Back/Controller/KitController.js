const path = require('path');
const Actividad = require('../Model/ActividadModel');
const Kit = require('../Model/KitModel');
const PackLego = require('../Model/PackLegoModel');
const ActividadKit = require('../Model/ActividadKitModel');
const sequelize = require('../config/Config_bd.env');


exports.crearKit = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const actividad_id = req.session.actividadId;

        // Crear kit incluyendo el ID de la actividad
        await Kit.create({
            nombre,
            descripcion,
            actividad_id: actividad_id
        });

        res.redirect('/profesor/dashboard');
    } catch (err) {
        console.error("Error al crear el kit:", err);
        res.status(500).send("No se pudo crear el kit");
    }


}

// muestra la vista de crear kits
exports.vistaCrear = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Kit.html'));
}

// Funcion que devuelve todos los kits existentes en la base de datos
exports.listarKits = async (req, res) => {
    try {
        const kits = await Kit.findAll({
            include: [{ model: PackLego, as: 'packs' }]
        });

        // Convertimos los PDFs de BLOB a base64
        const kitsConPDF = kits.map(kit => ({
            id: kit.id,
            nombre: kit.nombre,
            descripcion: kit.descripcion,
            pdf: kit.archivo_pdf ? Buffer.from(kit.archivo_pdf).toString('base64') : null,
            packs: kit.packs.map(pack => ({
                nombre: pack.nombre,
                descripcion: pack.descripcion,
                cantidad_total: pack.cantidad_total
            }))
        }));

        res.json(kitsConPDF);
    } catch (err) {
        console.error("Error al listar kits:", err);
        res.status(500).json({ error: "Error al listar kits" });
    }
}

// Función para ver el PDF del kit, recuperando el archivo PDF de la base de datos
exports.verPDF = async (req, res) => {
    try {
        const kit = await Kit.findByPk(req.params.id);
        if (!kit || !kit.archivo_pdf) {
            return res.status(404).send("PDF no encontrado");
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.send(kit.archivo_pdf);
    } catch (err) {
        console.error("Error al obtener el PDF:", err);
        res.status(500).send("Error interno");
    }
};

// Vista HTML, redirige a la página de ver kits
exports.vistaKitsDeActividad = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/VerKits.html'));
};

// API JSON, nos ayuda a obtener los kits de una actividad determinada
exports.obtenerKitsDeActividad = async (req, res) => {
    const actividadId = req.params.actividadId;

    try {
        const relaciones = await ActividadKit.findAll({ where: { actividad_id: actividadId } });

        const kitsConInfo = await Promise.all(relaciones.map(async rel => {
            const kit = await Kit.findByPk(rel.kit_id, {
                include: [{ model: PackLego, as: 'packs' }]
            });

            return {
                id: kit.id,
                nombre: kit.nombre,
                descripcion: kit.descripcion,
                cantidad_asignada: rel.cantidad_asignada,
                packs: kit.packs.map(p => ({
                    nombre: p.nombre,
                    descripcion: p.descripcion,
                    cantidad_total: p.cantidad_total
                }))
            };
        }));

        res.json(kitsConInfo);
    } catch (error) {
        console.error("Error al obtener los kits asignados:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Función para enviar la vista de edición de kits
exports.vistaEditarKits = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/EditarKit.html'));
};

// Función para procesar la edición de kits (incluye actualización en tabla PackLego)
exports.editarKits = async (req, res) => {
    let t;
    try {
        const actividadId = req.params.actividadId;
        const { kits } = req.body; // Se espera que kits sea un array de objetos: [{ kit_id, cantidad_asignada }, ...]

        if (!actividadId || !Array.isArray(kits)) {
            return res.status(400).json({ error: "Datos inválidos" });
        }

        t = await sequelize.transaction();

        // 1. Obtener las asignaciones existentes para esta actividad
        const asignacionesExistentes = await ActividadKit.findAll({
            where: { actividad_id: actividadId },
            transaction: t
        });
        // Crear un mapa para acceder fácilmente a la cantidad asignada por kit_id
        const existingMap = {};
        asignacionesExistentes.forEach(assignment => {
            existingMap[assignment.kit_id] = assignment.cantidad_asignada;
        });

        const updatedIds = [];

        // Dentro de la función editarKits en KitController.js:
        for (const kitData of kits) {
            if (kitData.cantidad_asignada < 0) {
                throw new Error(`Cantidad asignada para el kit ${kitData.kit_id} no puede ser negativa.`);
            }
            // Continúa con la lógica de actualización/inserción
        }

        // 2. Procesar cada asignación enviada (nueva o actualización)
        for (const kitData of kits) {
            const kitId = kitData.kit_id;
            const newCantidad = kitData.cantidad_asignada;
            // Determinar la cantidad vieja, si existe, o 0 si es nuevo
            const oldCantidad = existingMap[kitId] || 0;
            // Calcular la diferencia: diff > 0 significa que se aumenta la asignación y se debe restar esa diferencia al stock;
            // diff < 0 significa que se reduce la asignación y se debe sumar la diferencia (valor negativo) al stock.
            const diff = newCantidad - oldCantidad;

            if (existingMap.hasOwnProperty(kitId)) {
                // Actualizar el registro existente en ActividadKit
                await ActividadKit.update(
                    { cantidad_asignada: newCantidad },
                    { where: { actividad_id: actividadId, kit_id: kitId }, transaction: t }
                );
            } else {
                // Crear nuevo registro en ActividadKit
                await ActividadKit.create(
                    { actividad_id: actividadId, kit_id: kitId, cantidad_asignada: newCantidad },
                    { transaction: t }
                );
            }

            // Actualizar el stock en la tabla PackLego para este kit
            const packs = await PackLego.findAll({ where: { kit_id: kitId }, transaction: t });
            if (!packs.length) {
                throw new Error(`No hay packs asociados al kit ${kitId}`);
            }
            for (const pack of packs) {
                // Antes de actualizar, comprobar que el nuevo stock no sea negativo
                if (pack.cantidad_total - diff < 0) {
                    throw new Error(`Stock insuficiente para el kit ${kitId} en el pack ${pack.nombre}`);
                }
                pack.cantidad_total -= diff;
                await pack.save({ transaction: t });
            }

            updatedIds.push(kitId);
        }

        // 3. Procesar asignaciones eliminadas: aquellas que existían antes pero ya no se envían
        const deletedIds = Object.keys(existingMap)
            .map(idStr => parseInt(idStr))
            .filter(kitId => !updatedIds.includes(kitId));

        for (const kitId of deletedIds) {
            const oldCantidad = existingMap[kitId];
            // Para cada pack asociado a este kit, devolver el stock previamente asignado
            const packs = await PackLego.findAll({ where: { kit_id: kitId }, transaction: t });
            for (const pack of packs) {
                pack.cantidad_total += oldCantidad;
                await pack.save({ transaction: t });
            }
            // Eliminar la asignación de ActividadKit
            await ActividadKit.destroy({
                where: { actividad_id: actividadId, kit_id: kitId },
                transaction: t
            });
        }

        await t.commit();
        res.status(200).json({
            mensaje: "Kits actualizados correctamente",
            redirectTo: "/profesor/dashboard"
        });
    } catch (err) {
        if (t) await t.rollback();
        console.error("Error al editar kits:", err);
        res.status(500).json({ error: "Error interno al actualizar kits" });
    }
};