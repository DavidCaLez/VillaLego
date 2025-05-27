const Grupo = require('../Model/GrupoModel');
const Rol = require('../Model/RolModel');
const Alumno = require('../Model/AlumnoModel');
const Usuario = require('../Model/UsuarioModel');
const path = require('path');

exports.obtenerGruposConRoles = async (req, res) => {
    try {
        const turnoId = req.params.turnoId;

        const grupos = await Grupo.findAll({
            where: { turno_id: turnoId },
            include: [{
                model: Rol,
                include: [{
                    model: Alumno,
                    include: [{
                        model: Usuario,
                        attributes: ['nombre', 'correo']
                    }]
                }]
            }]
        });

        const resultado = grupos.map(grupo => ({
            grupoId: grupo.id,
            integrantes: grupo.Rols.map(r => ({
                alumnoId: r.alumno_id,
                nombre: r.Alumno?.Usuario?.nombre || 'Desconocido',
                correo: r.Alumno?.Usuario?.correo || 'Sin correo',
                rol: r.rol
            }))
        }));

        res.json(resultado);
    } catch (error) {
        console.error("❌ Error al obtener los grupos con roles:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
//muestra la vista de grupos
exports.vistaGrupos = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Grupos.html'));
};