const path = require('path');
const Turno = require('../Model/TurnoModel');
const Actividad = require('../Model/ActividadModel');
const Profesor = require('../Model/ProfesorModel');
const Rol = require('../Model/RolModel');
const AsignacionKits = require('../Model/AsignacionKitsModel');
const Grupo = require('../Model/GrupoModel');
const { Op } = require('sequelize');

exports.crearTurno = async (req, res) => {
    try {
        const turnos = req.body;

        const nuevosTurnos = await Turno.bulkCreate(turnos.map(({ fecha, hora }) => ({
            fecha,
            hora,
            actividad_id: req.session.actividad.id // Asignar el ID de la actividad desde la sesión
        })));
        req.session.turnos = nuevosTurnos; // Guardar turnos en la sesión
        // metemos el id de la actividad en la URL
        res.json({
            mensaje: 'Turnos guardados correctamente.',
            redirectTo: `/kit/asignarKits?actividadId=${req.session.actividad.id}`
        });
    } catch (err) {
        console.error('Error al crear turnos:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// Vista para crear turnos

exports.vistaTurnos = async (req, res) => {
    try {
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

exports.obtenerFaseTurno = async (req, res) => {
    try {

        const turnoId = req.params.turnoId;
        const turno = await Turno.findByPk(turnoId);

        if (!turno) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }


        const fase = turno.fase;

        res.json({ fase });
    } catch (error) {
        console.error('Error al obtener la fase del turno:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}
exports.vistaInstrucciones = (req, res) => {
    // Simplemente envía el archivo instrucciones.html
    res.sendFile(path.join(__dirname, '../../Front/html/Instrucciones.html'));
}

//nos devuelve la vista de priorización
exports.vistaPriorizacion = (req, res) => {
    res.sendFile(
        path.join(__dirname, '../../Front/html/Priorizacion.html')
    );
};

// API para obtener el rol y kit del alumno en un turno específico
exports.obtenerRolYKit = async (req, res) => {
    try {
        // — 1) Usuario autenticado
        const usuario = req.session.usuario;
        if (!usuario?.id) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        // — 2) Turno existe?
        const turnoId = req.params.turnoId;
        const turno = await Turno.findByPk(turnoId);
        if (!turno) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }

        console.log('Sesion:', req.session.usuario);
        console.log('Turno:', turno.id, 'Grupo:', turno.grupo_id);
        // — 3) Traer todos los roles de este alumno (independiente de turno)
        const roles = await Rol.findAll({
            where: { alumno_id: usuario.id }
        });
        if (roles.length === 0) {
            return res
                .status(404)
                .json({ error: 'Rol no encontrado para este alumno' });
        }

        // — 4) Buscar asignación de kit EN ESTE TURNO, pero **no** filtrar aquí el rol
        let entradaRol = roles[0];
        let kitId = null;
        for (const r of roles) {
            const asign = await AsignacionKits.findOne({
                where: {
                    turno_id: turnoId,
                    grupo_id: r.grupo_id
                }
            });
            if (asign) {
                entradaRol = r;
                kitId = asign.kit_id;
                break;
            }
        }

        // — 5) Extraer datos de la propia fila de Rol
        const { alumno_id, grupo_id, rol } = entradaRol;

        // — 6) Devolver siempre el rol (y kitId, que puede ser null)
        return res.json({
            alumnoId: alumno_id,
            grupoId: grupo_id,
            rol,
            kitId
        });
    } catch (err) {
        console.error('Error interno en obtenerRolYKit:', err);
        return res.status(500).json({ error: 'Error interno al obtener rol y kit' });
    }
};
exports.iniciarTurno = async (req, res) => {
    try {
        const turnoId = req.params.turnoId;
        // Verificar si el turno existe 
        const turno = await Turno.findByPk(turnoId);
        if (!turno) {
            return res.status(404).json({ error: 'Turno no encontrado' });
        }
        else if (turno.fase !== 'No iniciado') {
            turno.fase = 'Lectura instrucciones';
            await turno.save();
            // Redirigir a la vista de instrucciones
            console.log('Turno iniciado correctamente:', turno);
            res.sendFile(path.join(__dirname, '../../Front/html/controlFases.html'));
        } 
        else if (turno.fase === 'Terminado') {
            console.log('El turno ya ha sido terminado.');
            res.sendFile(path.join(__dirname, '../../Front/html/TurnoTerminado.html'));
        }else {
            console.log('El turno ya ha sido iniciado.');
            res.sendFile(path.join(__dirname, '../../Front/html/controlFases.html'));
        }

    } catch (err) {
        console.error('Error al iniciar el turno:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
}