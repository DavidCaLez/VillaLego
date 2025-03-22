const Usuario = require('../models/usuario');
const Alumno = require('../models/alumno');
const Profesor = require('../models/profesor');

exports.dashboard = (req, res) => {
    res.render('/Front/html/Profesor.html', { nombre: req.session.usuario.nombre });
};

exports.getUpgrade = async (req, res) => {
    const alumnos = await Alumno.findAll({ include: Usuario });
    res.render('profesor/upgrade', { alumnos });
};

exports.postUpgrade = async (req, res) => {
    const { usuario_id } = req.body;
    await Alumno.destroy({ where: { usuario_id } });
    await Profesor.create({ usuario_id });
    res.redirect('/profesor/upgrade');
};
