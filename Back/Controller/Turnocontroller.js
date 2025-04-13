const path = require('path');
const Turno = require('../Model/TurnoModel');
const Actividad = require('../Model/ActividadModel');
const Profesor = require('../Model/ProfesorModel');

exports.crearTurno = async (req, res) => {
    try {
        const turnos = req.body;
        const actividadId = req.session.actividad.id;

        const nuevosTurnos = turnos.map(({ fecha, hora }) => ({
            fecha,
            hora
        }));
        req.session.turnos = nuevosTurnos; // Guardar turnos en la sesión
        res.json({ mensaje: 'Turnos guardados correctamente.', redirectTo: `/actividad/asignarKits` });

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


