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
    const usuarioId = req.session.usuario.id;
    const { grupoId } = req.body;

    const transaction = await sequelize.transaction();

    try {
        const alumno = await Alumno.findOne({ where: { usuario_id: usuarioId }, transaction });
        if (!alumno) throw new Error("Alumno no encontrado.");

        // Verificar si el grupo existe y tiene espacio
        const grupo = await Grupo.findByPk(grupoId, { transaction });
        if (!grupo) throw new Error("Grupo no encontrado.");

        const inscritos = await Rol.count({ where: { grupo_id: grupoId }, transaction });
        if (inscritos >= grupo.tamanio) throw new Error("El grupo ya está completo.");

        // Ver roles ya asignados en ese grupo
        const rolesOcupados = await Rol.findAll({
            where: { grupo_id: grupoId },
            attributes: ['rol'],
            transaction
        });
        const ocupados = rolesOcupados.map(r => r.rol);

        const posibles = ['Product owner', 'Scrum Master', 'Desarrollador'].filter(r => {
            if (r === 'Desarrollador') return true;
            return !ocupados.includes(r);
        });

        if (posibles.length === 0) throw new Error("No hay roles disponibles en este grupo.");

        // Elegir uno aleatorio
        const rolAsignado = posibles[Math.floor(Math.random() * posibles.length)];

        // Eliminar inscripción anterior si la hay
        await Rol.destroy({
            where: { alumno_id: alumno.id },
            transaction
        });

        // Crear nuevo registro
        await Rol.create({
            alumno_id: alumno.id,
            grupo_id: grupoId,
            rol: rolAsignado
        }, { transaction });

        await transaction.commit();
        res.json({ mensaje: `✅ Inscripción completada con el rol: ${rolAsignado}` });

    } catch (error) {
        await transaction.rollback();
        console.error("❌ Error al inscribir:", error);
        res.status(500).json({ error: error.message || "Error inesperado" });
    }
};

// Obtiene todos los roles disponibles en el sistema
exports.obtenerRolesDisponibles = (req, res) => {
    const roles = Rol.rawAttributes.rol.values;
    res.json(roles);
};

exports.obtenerGrupoActual = async (req, res) => {
    const usuarioId = req.session.usuario.id;

    try {
        // Paso 1: Buscar al alumno por el usuario logueado
        const alumno = await Alumno.findOne({ where: { usuario_id: usuarioId } });
        if (!alumno) return res.json({ grupoId: null });

        // Paso 2: Buscar el rol (por alumno_id o id_Alumno, según tu tabla)
        const rol = await Rol.findOne({
            where: {
                alumno_id: alumno.id // ← usa aquí el campo correcto de tu tabla
            }
        });

        if (!rol) return res.json({ grupoId: null });

        // Paso 3: Obtener grupo asociado
        const grupoId = rol.grupo_id ?? rol.id_Grupo;
        if (!grupoId) return res.json({ grupoId: null });

        const grupo = await Grupo.findByPk(grupoId);

        return res.json({
            grupoId: grupo?.id,
            grupoNombre: grupo?.nombre ?? `ID: ${grupoId}`,
            rol: rol.rol
        });

    } catch (err) {
        console.error("❌ Error obteniendo grupo actual:", err);
        return res.status(500).json({ error: "Error interno" });
    }
};

exports.obtenerEstadoGrupos = async (req, res) => {
    const turnoId = req.params.turnoId;

    try {
        const grupos = await Grupo.findAll({ where: { turno_id: turnoId } });

        const estados = await Promise.all(grupos.map(async grupo => {
            console.log(`📊 Grupo ${grupo.id} – contando con campo grupo_id`);

            const inscritos = await Rol.count({ where: { grupo_id: grupo.id } });
            return {
                id: grupo.id,
                nombre: grupo.nombre,
                tamanio: grupo.tamanio,
                inscritos // 👈 este es clave
            };
        }));

        res.json(estados);
    } catch (err) {
        console.error("❌ Error al obtener estado de los grupos:", err);
        res.status(500).json({ error: "Error interno al obtener los grupos." });
    }
};