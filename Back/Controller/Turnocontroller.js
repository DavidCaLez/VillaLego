const path = require('path');
const Turno = require('../Model/TurnoModel');
const Actividad = require('../Model/ActividadModel');
const Profesor = require('../Model/ProfesorModel');

exports.crearTurno = async (req, res) => {
    try {
        const  turnos  = req.body;

        // Crear los turnos en la base de datos
        const actividadId = req.session.actividadId; // Get actividadId from session
        const nuevosTurnos = await Turno.bulkCreate(turnos.map(({ fecha, hora }) => ({ 
            fecha, 
            hora, 
            actividad_id: actividadId // Use the actividadId from session
        })));
        
        res.status(201).json({
            message: 'Turnos creados exitosamente',
            turnos: nuevosTurnos
        });
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


