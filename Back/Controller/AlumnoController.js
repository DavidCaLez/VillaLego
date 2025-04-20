const path = require('path');
const Grupo = require('../Model/GrupoModel');
const Alumno = require('../Model/AlumnoModel');
const Rol = require('../Model/RolModel');
const sequelize = require('../config/Config_bd.env');


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
// se puede borrar a partir del dia 23 de abril
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

exports.inscribirAlumnoConRol = async (req, res) => {
    const { grupoId, rol } = req.body;
    const usuarioId = req.session.usuario.id;

    const transaction = await sequelize.transaction();
    try {
        const alumno = await Alumno.findOne({ where: { usuario_id: usuarioId }, transaction });
        if (!alumno) throw new Error("Alumno no encontrado");

        // Verificar unicidad del rol (excepto Desarrollador)
        if (rol !== 'Desarrollador') {
            const yaAsignado = await Rol.findOne({
                where: {
                    grupo_id: grupoId,
                    rol: rol
                },
                transaction
            });

            if (yaAsignado) {
                throw new Error(`Ya hay un miembro con el rol "${rol}" en este grupo.`);
            }
        }

        alumno.grupo_id = grupoId;
        await alumno.save({ transaction });

        await Rol.create({
            alumno_id: alumno.id,
            grupo_id: grupoId,
            rol
        }, { transaction });

        await transaction.commit();
        return res.json({ mensaje: "✅ Inscripción y rol registrados correctamente." });
    } catch (error) {
        await transaction.rollback();
        console.error("❌ Error:", error);
        return res.status(400).json({ error: error.message || "Error interno" });
    }
};

exports.obtenerRolesDisponibles = (req, res) => {
    const roles = Rol.rawAttributes.rol.values;
    res.json(roles);
};