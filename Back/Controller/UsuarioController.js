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
        res.redirect('/login.html');
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
    if (!usuario) return res.redirect('/error.html?message=Usuario no encontrado');

    const valid = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!valid) return res.redirect('/error.html?message=Contraseña incorrecta');

    req.session.usuario = { id: usuario.id, nombre: usuario.nombre };

    const esProfesor = await Profesor.findOne({ where: { usuario_id: usuario.id } });
    const esAlumno = await Alumno.findOne({ where: { usuario_id: usuario.id } });

    if (esProfesor) return res.redirect('/Profesor.html');
    else if (esAlumno) return res.redirect('/alumno/dashboard');
    else return res.redirect('/error.html?message=Tipo de usuario no identificado');
};

exports.logout = (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
};