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
        console.log("🟢 Turnos encontrados:", turnos);

        res.json(turnos);
    } catch (err) {
        console.error("❌ Error al obtener turnos:", err);
        res.status(500).json({ error: "Error al obtener los turnos" });
    }
};




