const path = require('path');
const Grupo = require('../Model/GrupoModel');
const Alumno = require('../Model/AlumnoModel');

exports.vistaGrupos = (req, res) => {
    // Sirve la misma vista Alumno.html, que ahora renderizará grupos
    res.sendFile(path.join(__dirname, '../../Front/html/Alumno.html'));
};

exports.obtenerGruposPorTurno = async (req, res) => {
    try {
        const turnoId = req.params.turnoId;
        // Obtenemos todos los grupos de ese turno
        const grupos = await Grupo.findAll({
            where: { turno_id: turnoId }
        });
        res.json(grupos);
    } catch (error) {
        console.error('Error fetching grupos:', error);
        res.status(500).json({ error: 'Error interno' });
    }
};

exports.inscribirGrupo = async (req, res) => {
    try {
        const usuarioId = req.session.usuario.id;
        const { grupoId } = req.body;
        // Suponemos que ya existe un registro en Alumno y solo actualizamos su grupo_id
        const alumno = await Alumno.findOne({ where: { usuario_id: usuarioId } });
        if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });
        alumno.grupo_id = grupoId;
        await alumno.save();
        res.json({ mensaje: 'Inscripción exitosa' });
    } catch (error) {
        console.error('Error inscribiendo alumno:', error);
        res.status(500).json({ error: 'No se pudo inscribir' });
    }
};
exports.dashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Alumno.html'));
};

