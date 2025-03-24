const Usuario = require('../Model/UsuarioModel');
const Alumno = require('../Model/AlumnoModel');
const Profesor = require('../Model/ProfesorModel');

const path = require('path');

exports.dashboardProfesor = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Profesor.html'));
}

exports.dashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/ProfesorAdmin.html'));
};

exports.getUpgrade = async (req, res) => {
    const alumnos = await Alumno.findAll({ include: Usuario });
    res.sendFile(path.join(__dirname, '../../Front/html/Upgrade.html'));
};

exports.postUpgrade = async (req, res) => {
    const { usuario_id } = req.body;
    await Alumno.destroy({ where: { usuario_id } });
    await Profesor.create({ usuario_id });
    res.redirect('/Front/html/Profesor.html');
};
