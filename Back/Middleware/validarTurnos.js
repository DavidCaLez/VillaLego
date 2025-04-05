
const Turno = require('../Model/TurnoModel'); // Asegúrate de importar tu modelo de Turno
const { Op } = require('sequelize');

const validarTurnos = async (req, res, next) => {
    try {
        const  turnos  = req.body;
         // Suponiendo que envías un array de turnos desde el frontend

        // Verificar si alguno de los turnos ya existe en la base de datos
        const turnosExistentes = await Turno.findAll({
            where: {
                [Op.or]: turnos.map(turno => ({
                    fecha: turno.fecha,
                    hora: turno.hora
                }))
            }
        });
        if (turnosExistentes.length > 0) {
            return res.status(400).json({
                error: 'Algunos turnos ya existen en la base de datos.',
                turnosExistentes: turnosExistentes.map(turno => turno.hora)
            });
        }

        next(); // Si no hay conflictos, pasa al siguiente middleware/controlador
    } catch (err) {
        console.error('Error al validar turnos:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = validarTurnos;