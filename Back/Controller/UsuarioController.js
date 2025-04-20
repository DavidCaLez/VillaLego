const Usuario = require('../Model/UsuarioModel');
const Alumno = require('../Model/AlumnoModel');
const Profesor = require('../Model/ProfesorModel');
const bcrypt = require('bcrypt');

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

    req.session.usuario = { id: usuario.id, nombre: usuario.nombre ,correo: usuario.correo};

    
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