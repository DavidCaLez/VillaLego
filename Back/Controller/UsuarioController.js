const Usuario = require('../Model/UsuarioModel');
const Alumno = require('../Model/AlumnoModel');
const Profesor = require('../Model/ProfesorModel');
const bcrypt = require('bcrypt');

// al principio, junto a los otros requires:
const sequelize = require('../config/Config_bd.env');
const Actividad = require('../Model/ActividadModel');
const Turno = require('../Model/TurnoModel');
const Grupo = require('../Model/GrupoModel');
const Rol = require('../Model/RolModel');
const ActividadKit = require('../Model/ActividadKitModel');
const AsignacionKits = require('../Model/AsignacionKitsModel');
const HistoriaUsuario = require('../Model/HistoriaUsuarioModel');


const path = require('path');

exports.getRegister = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/register.html'));
};

exports.postRegister = async (req, res) => {
    try {
        const { nombre, correo, contraseña } = req.body;
        const hash = await bcrypt.hash(contraseña, 10);
        const usuario = await Usuario.create({ nombre, correo, contraseña: hash });
        await Alumno.create({ usuario_id: usuario.id });
        res.redirect('/login');
    } catch (err) {
        console.error("Error en el registro:", err);
        res.status(500).send('Error al registrar el usuario');
    }
};

exports.getLogin = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/login.html'));
};

exports.postLogin = async (req, res) => {
    const { correo, contraseña } = req.body;
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
        return res.redirect('/login?tipo=error&mensaje=' + encodeURIComponent('No se pudo iniciar sesión, por favor revise su correo o contraseña'));
    }

    const valid = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!valid) {
        return res.redirect('/login?tipo=error&mensaje=' + encodeURIComponent('No se pudo iniciar sesión, por favor revise su correo o contraseña'));
    }

    req.session.usuario = { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo };


    const esProfesor = await Profesor.findOne({ where: { usuario_id: usuario.id } });
    const esAlumno = await Alumno.findOne({ where: { usuario_id: usuario.id } });

    // Redirección pendiente
    const redireccionPendiente = req.session.redirectTo;
    delete req.session.redirectTo;

    if (redireccionPendiente) return res.redirect(redireccionPendiente);
    else if (esProfesor) return res.redirect('/profesor/dashboard');
    else if (esAlumno) return res.redirect('/alumno/dashboard');
    else return res.redirect('/login?tipo=error&mensaje=' + encodeURIComponent('Tipo de usuario no identificado'));

};

exports.logout = (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
};

exports.obtenerInicial = (req, res) => {
    // Verifica si el usuario está autenticado y que tenga una propiedad "correo"
    if (!req.session.usuario) {
        return res.status(401).json({ error: 'El usuario no está autenticado' });
    }
    const { correo } = req.session.usuario;
    if (!correo) {
        return res.status(400).json({ error: 'No se encontró el correo del usuario' });
    }

    // Toma la primera letra del correo y la pasa a mayúsculas
    const inicial = correo.charAt(0).toUpperCase();

    // Envía JSON al frontend
    return res.json({ inicial });
}

// Obtener datos del perfil como JSON
exports.obtenerPerfil = async (req, res) => {
    const usuarioId = req.session.usuario?.id;
    if (!usuarioId) return res.status(401).send('No autenticado');

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    res.json({ nombre: usuario.nombre, correo: usuario.correo });
};

// Servir vista del perfil del profesor
exports.vistaPerfil = (req, res) => {
    console.log("Mostrando perfil del profesor");
    res.sendFile(path.join(__dirname, '../../Front/html/PerfilProfesor.html'));
};




exports.darseDeBaja = async (req, res) => {
    const usuarioId = req.session.usuario?.id;
    if (!usuarioId) return res.status(401).send('No autenticado');

    const t = await sequelize.transaction();
    try {
        // Si era profesor, eliminamos sus actividades y todo lo relacionado
        const profesor = await Profesor.findOne({ where: { usuario_id: usuarioId }, transaction: t });
        if (profesor) {
            const actividades = await Actividad.findAll({ where: { profesor_id: usuarioId }, transaction: t });
            for (const act of actividades) {
                // 1) Turnos → Grupos → Roles & Asignaciones
                const turnos = await Turno.findAll({ where: { actividad_id: act.id }, transaction: t });
                for (const turno of turnos) {
                    await AsignacionKits.destroy({ where: { turno_id: turno.id }, transaction: t });
                    const grupos = await Grupo.findAll({ where: { turno_id: turno.id }, transaction: t });
                    for (const grupo of grupos) {
                        await Rol.destroy({ where: { grupo_id: grupo.id }, transaction: t });
                        await AsignacionKits.destroy({ where: { grupo_id: grupo.id }, transaction: t });
                    }
                    await Grupo.destroy({ where: { turno_id: turno.id }, transaction: t });
                }
                await Turno.destroy({ where: { actividad_id: act.id }, transaction: t });

                // 2) Eliminamos las uniones ActividadKit (pero no los kits ni las historias)
                await ActividadKit.destroy({ where: { actividad_id: act.id }, transaction: t });
            }
            // 3) Borrar registro de profesor
            await Profesor.destroy({ where: { usuario_id: usuarioId }, transaction: t });
        }

        // 4) Si era alumno, borramos registro de alumno
        await Alumno.destroy({ where: { usuario_id: usuarioId }, transaction: t });

        // 5) Borrar usuario
        await Usuario.destroy({ where: { id: usuarioId }, transaction: t });

        await t.commit();
        // 6) Destruir sesión y responder JSON
        +   req.session.destroy(err => {
            if (err) {
                console.error('Error destruyendo sesión:', err);
                return res.status(500).json({ error: 'Error destruyendo la sesión' });
            }
            res.status(200).json({ redirectTo: '/register?mensaje=Cuenta%20eliminada%20correctamente' });
        });

    } catch (err) {
        await t.rollback();
        console.error('❌ Error en darseDeBaja:', err);
        res.status(500).send('No se pudo completar la baja');
    }
};
