const path = require('path');
const Actividad = require('../Model/ActividadModel');
const Kit = require('../Model/KitModel');
const PackLego = require('../Model/PackLegoModel');
const ActividadKit = require('../Model/ActividadKitModel');

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
exports.vistaCrear = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Kit.html'));
}

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

// Función para ver el PDF del kit
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

exports.editarKits = async (req, res) => {
    try {
        // Se recibe el ID de la actividad por parámetro y los kits a editar en el body
        const actividadId = req.params.actividadId;
        const { kits } = req.body; // Se espera un objeto con { kits: [ { kit_id, cantidad_asignada } ] }

        if (!actividadId) {
            return res.status(400).json({ error: "ID de la actividad es requerido" });
        }
        if (!Array.isArray(kits)) {
            return res.status(400).json({ error: "El campo kits debe ser un arreglo." });
        }

        // Iniciar transacción con la instancia de Sequelize
        const sequelize = require('../config/Config_bd.env');
        const t = await sequelize.transaction();

        try {
            // Recuperar los registros existentes para la actividad
            const asignacionesExistentes = await require('../Model/ActividadKitModel').findAll({ 
                where: { actividad_id: actividadId },
                transaction: t 
            });
            // Usaremos el kit_id como identificador único (combinado con actividad_id)
            const existingKitIds = asignacionesExistentes.map(asig => asig.kit_id);

            // Almacenará los kit_ids que se actualizaron o crearon
            const updatedKitIds = [];

            // Procesar cada kit enviado desde el cliente
            for (const kitData of kits) {
                if (existingKitIds.includes(kitData.kit_id)) {
                    // Actualizar registro existente
                    await require('../Model/ActividadKitModel').update(
                        { cantidad_asignada: kitData.cantidad_asignada },
                        { where: { actividad_id: actividadId, kit_id: kitData.kit_id }, transaction: t }
                    );
                    updatedKitIds.push(kitData.kit_id);
                } else {
                    // Crear nuevo registro de asignación
                    await require('../Model/ActividadKitModel').create({
                        actividad_id: actividadId,
                        kit_id: kitData.kit_id,
                        cantidad_asignada: kitData.cantidad_asignada
                    }, { transaction: t });
                    updatedKitIds.push(kitData.kit_id);
                }
            }

            // Eliminar las asignaciones que estaban en la base de datos pero que ya no se envían
            const kitIdsAEliminar = existingKitIds.filter(id => !updatedKitIds.includes(id));
            if (kitIdsAEliminar.length > 0) {
                await require('../Model/ActividadKitModel').destroy({
                    where: { actividad_id: actividadId, kit_id: kitIdsAEliminar },
                    transaction: t
                });
            }

            // Confirmar la transacción
            await t.commit();
            res.status(200).json({ 
                mensaje: "Kits actualizados con éxito", 
                redirectTo: `/actividad/asignarKits/${actividadId}` // ajustar redirección según convenga
            });
        } catch (err) {
            // En caso de error se revierte la transacción
            await t.rollback();
            throw err;
        }
    } catch (err) {
        console.error("Error al editar kits:", err);
        res.status(500).json({ error: "Error interno al actualizar kits" });
    }
};

exports.vistaEditarKits = (req, res) => {
    // Se asume que el archivo se llama "EditarKits.html" y se encuentra en la carpeta Front/html
    res.sendFile(path.join(__dirname, '../../Front/html/EditarKit.html'));
};
