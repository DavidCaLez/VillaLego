const path = require('path');
const Actividad = require('../Model/ActividadModel');
const Profesor = require('../Model/ProfesorModel');
const ActividadKit = require('../Model/ActividadKitModel');
const PackLego = require('../Model/PackLegoModel');
const Turno = require('../Model/TurnoModel');
const Usuario = require('../Model/UsuarioModel');


//Vistas para 

exports.vistaDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Actividad.html'));
};

exports.vistaCrear = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Actividad.html'));
};

exports.getActividades = async (req, res) => {
    const actividades = await Actividad.findAll();
    res.json(actividades);
};

// Crea la actividad con el profesor logueado como creador de la actividad

exports.crearActividad = async (req, res) => {
    try {
        const { nombre, tamaño_min, tamaño_max } = req.body;

        // Buscar al profesor correspondiente al usuario logueado

        const profesor = await Profesor.findOne({ where: { usuario_id: req.session.usuario.id } });

        // Validación por si no se encuentra profesor
        if (!profesor) {
            return res.status(404).send('Profesor no encontrado para este usuario');
        }

        // Crear actividad incluyendo el ID del profesor

        // Crear objeto de actividad sin guardarlo en la base de datos
        const nuevaActividad = ({
            nombre,
            tamaño_min,
            tamaño_max,
            profesor_id: profesor.usuario_id
        });

        // Guardar el ID de la actividad recién creada en la sesión
        req.session.actividad = nuevaActividad;
        

        res.redirect(`/turno/turnos`); // Redirigir a la vista de asignación de kits
    } catch (err) {
        console.error("Error al crear la actividad:", err);
        res.status(500).send("No se pudo crear la actividad");
    }
};

exports.obtenerActividad = async (req, res) => {
    const actividad = await Actividad.findByPk(req.params.id);

    if (!actividad) return res.status(404).send('Actividad no encontrada');

    // Obtener datos del profesor
    const profesor = await Usuario.findByPk(actividad.profesor_id, {
        attributes: ['nombre', 'correo']
    });

    res.json({
        ...actividad.toJSON(),
        profesorNombre: profesor?.nombre || 'Desconocido',
        profesorCorreo: profesor?.correo || 'No disponible'
    });
};

exports.editarActividad = async (req, res) => {
    const { nombre, fecha, tamaño_min, tamaño_max } = req.body;
    try {
        await Actividad.update(
            { nombre, fecha, tamaño_min, tamaño_max },
            { where: { id: req.params.id } }
        );
        // IMPORTANTE: Responder con status 200 en JSON
        res.status(200).json({ mensaje: "Actividad actualizada con éxito" });
    } catch (err) {
        console.error("Error al editar la actividad:", err);
        res.status(500).json({ error: "No se pudo actualizar la actividad" });
    }
};


//redirige a la vista de asignar kits

exports.vistaAsignarKits = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/asignarKits.html'));
};

/* Controlador que maneja la asignación de kits a una actividad.
   Recibe un array de objetos con kitId y cantidad desde el frontend.
   Verifica que haya suficiente stock y crea la relación Actividad-Kit.
   Descuenta la cantidad de cada PackLego asociado.
   Devuelve un mensaje de éxito o error detallado.
   Si hay un error, se hace un rollback de la transacción.
   Si no hay error, se hace commit de la transacción.*/

exports.asignarKits = async (req, res) => {
    let { seleccion } = req.body;

    // Validación inicial: seleccion debe ser un array

    if (!Array.isArray(seleccion)) {
        console.error("⚠️ Error: La selección recibida no es un array:", seleccion);
        return res.status(400).json({ error: "Formato inválido: la selección debe ser un array" });
    }
    // Inicia una transacción
    
    const sequelize = require('../config/Config_bd.env');
    const t = await sequelize.transaction();
    try {
        const nAct =await Actividad.create(req.session.actividad, { transaction: t });
        // Recorre cada kit seleccionado
        const turnosConActividad = req.session.turnos.map(turno => ({
            ...turno,
            actividad_id: nAct.id
        }));
        await Turno.bulkCreate(turnosConActividad, { transaction: t });
        for (const { kitId, cantidad } of seleccion) {
            const packs = await PackLego.findAll({ where: { kit_id: kitId }, transaction: t });

            if (!packs.length) {
                throw new Error(`No hay packs asociados al kit ${kitId}`);
            }

            const stockSuficiente = packs.every(pack => pack.cantidad_total >= cantidad);
            if (!stockSuficiente) {
                throw new Error(`Stock insuficiente para el kit ${kitId}`);
            }
 
            // Añadir el ID de la actividad a cada turno
 
 
            // Crear relación Actividad-Kit
            await ActividadKit.create({
                actividad_id: nAct.id,
                kit_id: kitId,
                cantidad_asignada: cantidad
            }, { transaction: t });

            // Actualizar stock de cada pack del kit
            for (const pack of packs) {
                pack.cantidad_total -= cantidad;
                await pack.save({ transaction: t });
            }
        }

        // Si todo va bien, guardar cambios
        await t.commit();
        console.log(`✅ Kits asignados correctamente a la actividad ${nAct.id}`);
        res.status(200).json({ mensaje: "Kits asignados correctamente", redirectTo: "/profesor/dashboard" });

    } catch (err) {
        // Si hay error, deshacer todo
        await t.rollback();

        console.error(`🛑 ROLLBACK EJECUTADO: no se asignó ningún kit a la actividad ${actividadId}`);
        console.error("🔍 Motivo:", err.message);

        if (!res.headersSent) {
            res.status(400).json({ error: err.message });
        }
    }
}
    ;

exports.vistaEditar = (req, res) => {
    // Se envía el archivo editarActividad.html ubicado en Front/html
    res.sendFile(path.join(__dirname, '../../Front/html/editarActividad.html'));
};