const Usuario = require('../models/usuario');
const Alumno = require('../models/alumno');
const Profesor = require('../models/profesor');
const bcrypt = require('bcrypt');

exports.getRegister = (req, res) => {
    res.render('register');
};

exports.postRegister = async (req, res) => {
    const { nombre, correo, contraseña } = req.body;
    const hash = await bcrypt.hash(contraseña, 10);
    const usuario = await Usuario.create({ nombre, correo, contraseña: hash });
    await Alumno.create({ usuario_id: usuario.id });
    res.redirect('/login');
};

exports.getLogin = (req, res) => {
    res.render('login');
};

exports.postLogin = async (req, res) => {
    const { correo, contraseña } = req.body;
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) return res.status(400).send('Usuario no encontrado');

    const valid = await bcrypt.compare(contraseña, usuario.contraseña);   
    if (!valid) return res.status(400).send('Contraseña incorrecta');

    req.session.usuario = { id: usuario.id, nombre: usuario.nombre };

    const esProfesor = await Profesor.findOne({ where: { usuario_id: usuario.id } });
    const esAlumno = await Alumno.findOne({ where: { usuario_id: usuario.id } });

    if (esProfesor) return res.redirect('/profesor/dashboard');
    else if (esAlumno) return res.redirect('/alumno/dashboard');
    else return res.status(403).send('Tipo de usuario no identificado');
};

exports.logout = (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
};