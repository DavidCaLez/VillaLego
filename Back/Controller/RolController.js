const Rol = require('../Model/RolModel');
const Usuario = require('../Model/UsuarioModel');
const Alumno = require('../Model/AlumnoModel');

exports.obtenerDesarrolladores = async (req, res) => {
    try {
        const grupoId = req.params.grupoId;
        
        // Buscar roles de desarrollador en el grupo
        const roles = await Rol.findAll({
            where: { 
                grupo_id: grupoId,
                rol: 'Desarrollador'
            },
            include: [{
                model: Alumno,
                include: [{
                    model: Usuario,
                    attributes: ['nombre']
                }]
            }]
        });

        // Formatear la respuesta
        const desarrolladores = roles.map(rol => ({
            id: rol.alumno_id,
            nombre: rol.Alumno.Usuario.nombre
        }));

        res.json(desarrolladores);
    } catch (err) {
        console.error('Error al obtener desarrolladores:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};