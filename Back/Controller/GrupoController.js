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

exports.mezclarRoles = async (req, res) => {
    try {
        const turnoId = req.params.turnoId;

        // 1. Obtener todos los grupos de este turno, incluyendo sus Rols
        const grupos = await Grupo.findAll({
            where: { turno_id: turnoId },
            include: [{ model: Rol }]
        });

        // Función auxiliar para barajar un array (Fisher–Yates)
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        // 2. Para cada grupo, barajar y reasignar roles
        for (const grupo of grupos) {
            const rolesInstancias = grupo.Rols; // cada instancia Rol
            if (!rolesInstancias || rolesInstancias.length === 0) continue;

            // Extraer los valores de 'rol'
            const rolesActuales = rolesInstancias.map(r => r.rol);

            // Barajar el arreglo de roles
            shuffleArray(rolesActuales);

            // Reasignar uno a uno y guardar en BD
            for (let i = 0; i < rolesInstancias.length; i++) {
                const rolInst = rolesInstancias[i];
                rolInst.rol = rolesActuales[i];
                await rolInst.save();
            }
        }

        // 3. Devolver respuesta de éxito
        res.json({ mensaje: "Roles mezclados correctamente" });
    } catch (error) {
        console.error("❌ Error al mezclar roles:", error);
        res.status(500).json({ error: "No se pudieron mezclar los roles" });
    }
};