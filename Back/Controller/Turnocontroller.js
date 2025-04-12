const path = require('path');
const Turno = require('../Model/TurnoModel');
const Actividad = require('../Model/ActividadModel');
const Profesor = require('../Model/ProfesorModel');

exports.crearTurno = async (req, res) => {
    try {
        const turnos = req.body;
        const actividadId = req.session.actividadId;

        const nuevosTurnos = await Turno.bulkCreate(turnos.map(({ fecha, hora }) => ({
            fecha,
            hora,
            actividad_id: actividadId
        })));

        res.json({ mensaje: 'Turnos guardados correctamente.', redirectTo: `/actividad/asignarKits/${actividadId}` });

    } catch (err) {
        console.error('Error al crear turnos:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Vista para crear turnos

exports.vistaTurnos = async (req, res) => {
    try {
        const actividades = await Actividad.findAll();
        res.sendFile(path.join(__dirname, '../../Front/html/Turno.html'));
    } catch (err) {
        console.error('Error al cargar la vista de creación de turnos:', err);
        res.status(500).send('Error interno del servidor');
    }
}

// Vista para ver turnos
exports.vistaVerTurnos = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/VerTurnos.html'));
};

// devuelve un archivo .json de tal manera con la información de los turnos que pertenecen a una actividad
exports.obtenerTurnosPorActividad = async (req, res) => {
    try {
        const actividadId = req.params.actividadId;
        console.log("🔍 Buscando turnos para actividad:", actividadId);
        
        const turnos = await Turno.findAll({ where: { actividad_id: actividadId } });
        //console.log("🟢 Turnos encontrados:", turnos);

        res.json(turnos);
    } catch (err) {
        console.error("❌ Error al obtener turnos:", err);
        res.status(500).json({ error: "Error al obtener los turnos" });
    }
};

// maneja la edicion de los turnos de una actividad
exports.editarTurno = async (req, res) => {
    try {
        const actividadId = req.params.actividadId;
        const { turnos } = req.body; // Se espera un objeto { turnos: [...] }

        if (!actividadId) {
            return res.status(400).json({ error: "ID de la actividad es requerido" });
        }
        if (!Array.isArray(turnos)) {
            return res.status(400).json({ error: "El campo turnos debe ser un arreglo." });
        }

        // Obtener la instancia de Sequelize para la transacción
        const sequelize = require('../config/Config_bd.env');
        const t = await sequelize.transaction();

        try {
            // Obtener los turnos existentes en la base de datos para esta actividad
            const turnosExistentes = await Turno.findAll({ 
                where: { actividad_id: actividadId },
                transaction: t 
            });
            const existingIds = turnosExistentes.map(turno => turno.id);

            // Almacena los IDs de turnos actualizados o creados
            const updatedIds = [];

            // Procesar cada turno recibido
            for (const turnoData of turnos) {
                if (turnoData.id) {
                    // Actualiza el turno existente
                    await Turno.update(
                        { fecha: turnoData.fecha, hora: turnoData.hora },
                        { where: { id: turnoData.id, actividad_id: actividadId }, transaction: t }
                    );
                    updatedIds.push(parseInt(turnoData.id));
                } else {
                    // Crear un nuevo turno
                    const nuevoTurno = await Turno.create({
                        fecha: turnoData.fecha,
                        hora: turnoData.hora,
                        actividad_id: actividadId
                    }, { transaction: t });
                    updatedIds.push(nuevoTurno.id);
                }
            }

            // Eliminar aquellos turnos que existían pero que no fueron enviados en la edición
            const idsAEliminar = existingIds.filter(id => !updatedIds.includes(id));
            if (idsAEliminar.length > 0) {
                await Turno.destroy({
                    where: { id: idsAEliminar, actividad_id: actividadId },
                    transaction: t
                });
            }

            // Confirmar la transacción
            await t.commit();
            res.status(200).json({ 
                mensaje: "Turnos actualizados con éxito", 
                redirectTo: `/profesor/dashboard` // cuando guarda el turno redirige a la vista de profesor
            });
        } catch (err) {
            // En caso de error, deshacer todos los cambios
            await t.rollback();
            throw err;
        }
    } catch (err) {
        console.error("Error al actualizar turnos:", err);
        res.status(500).json({ error: "Error interno al actualizar turnos" });
    }
};


// Controlador para mostrar la vista de editarTurno
exports.vistaEditarTurno = (req, res) => {
  // Simplemente envía el archivo editarTurno.html 
    res.sendFile(path.join(__dirname, '../../Front/html/editarTurno.html'));
};




