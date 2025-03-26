const path = require('path');
const Alumno = require('../Model/AlumnoModel');
const Usuario = require('../Model/UsuarioModel');

exports.dashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Alumno.html'));
};

exports.getAlumnosJSON = async (req, res) => {
    const alumnos = await Alumno.findAll({ include: Usuario });
    res.json(alumnos);
};