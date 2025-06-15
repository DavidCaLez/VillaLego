const Usuario = require('../Model/UsuarioModel');
const Alumno = require('../Model/AlumnoModel');
const Profesor = require('../Model/ProfesorModel');
const Turno = require('../Model/TurnoModel');
const Grupo = require('../Model/GrupoModel');
const Rol = require('../Model/RolModel');
const ActividadKit = require('../Model/ActividadKitModel');
const Actividad = require('../Model/ActividadModel');
const AsignacionKits = require('../Model/AsignacionKitsModel');
const sequelize = require('../config/Config_bd.env');

const path = require('path');

exports.dashboard = (req, res) => {
    console.log("Mostrando vista general del profesor");
    res.sendFile(path.join(__dirname, '../../Front/html/Profesor.html'));
};

const fs = require('fs');

exports.getCrearProfesor = async (req, res) => {
    const alumnos = await Alumno.findAll({ include: Usuario });

    const templatePath = path.join(__dirname, '../../Front/html/CrearProfesor.html');
    const template = fs.readFileSync(templatePath, 'utf8');

    // Construir HTML con alumnos
    let listaHTML = '';
    for (const a of alumnos) {
        listaHTML += `
        <div class="alumno-card">
        <div>
            <strong>${a.Usuario.nombre}</strong><br>
            ${a.Usuario.correo}
            </div>
        <form action="/profesor/CrearProfesor" method="POST">
            <input type="hidden" name="usuario_id" value="${a.usuario_id}" />
            <button class="btn-ascender" type="submit">Ascender</button>
        </form>
        </div>
    `;
    }

    // Reemplazar marcador en plantilla
    const htmlFinal = template.replace('<!-- ARI_VAN_LOS_ALUMNOS -->', listaHTML);
    console.log("Mostrando vista de crear profesor con alumnos:", alumnos);
    res.send(htmlFinal);
};

// Crea un nuevo profesor a partir de un alumno solo si el correo contiene @upm.es, en caso 
// contrario no se le permite ascender y muestra un mensaje de error
exports.postCrearProfesor = async (req, res) => {
    const { usuario_id } = req.body;

    try {
        const usuario = await Usuario.findByPk(usuario_id);

        if (!usuario) {
            return res.redirect('/profesor/CrearProfesor?mensaje=Usuario%20no%20encontrado&tipo=error');
        } else {
            await Alumno.destroy({ where: { usuario_id } });
            await Profesor.create({ usuario_id });
            console.log('Alumno ascendido a profesor:', usuario.nombre);
            res.redirect('/profesor/CrearProfesor?mensaje=Alumno%20ascendido%20correctamente&tipo=exito');
        }

    } catch (error) {
        console.error('Error al ascender a profesor:', error);
        res.redirect('/profesor/CrearProfesor?mensaje=Error%20interno%20del%20servidor&tipo=error');
    }
};



exports.borrarActividad = async (req, res) => {
    const { id } = req.params;
    console.log('[borrarActividad] id =', id);

    const t = await sequelize.transaction();

    try {
        // 1) Get turnos
        const turnos = await Turno.findAll({
            where: { actividad_id: id },
            transaction: t
        });
        const turnoIds = turnos.map(tu => tu.id);

        // 2) Get grupos
        const grupos = await Grupo.findAll({
            where: { turno_id: turnoIds },
            transaction: t
        });
        const grupoIds = grupos.map(gr => gr.id);

        // 3) Delete roles first
        await Rol.destroy({
            where: { grupo_id: grupoIds },
            transaction: t
        });

        // 4) Get kit_ids from ActividadKit first
        const actividadKits = await ActividadKit.findAll({
            where: { actividad_id: id },
            transaction: t
        });
        const kitIds = actividadKits.map(ak => ak.kit_id);

        // 5) Delete AsignacionKits referencing those kit_ids
        await AsignacionKits.destroy({
            where: { 
                kit_id: kitIds,
                actividad_id: id
            },
            transaction: t
        });

        // 6) Delete grupos
        await Grupo.destroy({
            where: { id: grupoIds },
            transaction: t
        });

        // 7) Delete turnos
        await Turno.destroy({
            where: { id: turnoIds },
            transaction: t
        });

        // 8) Now we can safely delete ActividadKit
        await ActividadKit.destroy({
            where: { actividad_id: id },
            transaction: t
        });

        // 9) Finally delete actividad
        await Actividad.destroy({
            where: { id },
            transaction: t
        });

        await t.commit();
        console.log('[borrarActividad] éxito');
        return res.sendStatus(200);

    } catch (error) {
        await t.rollback();
        console.error('[borrarActividad] error:', error);
        return res.status(500).send(error.message);
    }
};



// Obtener datos del perfil como JSON
/*exports.obtenerPerfil = async (req, res) => {
    const usuarioId = req.session.usuario?.id;
    if (!usuarioId) return res.status(401).send('No autenticado');

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    res.json({ nombre: usuario.nombre, correo: usuario.correo });
};*/

// Servir vista del perfil del profesor
/*exports.vistaPerfil = (req, res) => {
    console.log("Mostrando perfil del profesor");
    res.sendFile(path.join(__dirname, '../../Front/html/PerfilProfesor.html'));
};*/