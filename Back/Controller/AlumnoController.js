const path = require('path');
const Alumno = require('../Model/AlumnoModel');
const Usuario = require('../Model/UsuarioModel');

exports.dashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Alumno.html'));
};

