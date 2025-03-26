const Usuario = require('../Model/UsuarioModel');
const Alumno = require('../Model/AlumnoModel');
const Profesor = require('../Model/ProfesorModel');
const Actividad = require('../Model/ActividadModel');


const path = require('path');

//Relacionado con Usuario
exports.dashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Profesor.html'));
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

//Relacionado con Actividad
exports.vistaCrear = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Actividad.html'));
};

exports.editarActividad = async (req, res) => {
    const { nombre, fecha, tamaño_min, tamaño_max } = req.body;
    await Actividad.update(
    { nombre, fecha, tamaño_min, tamaño_max },
    { where: { id: req.params.id } }
    );
    res.redirect('/actividad/crear');
};

exports.obtenerActividad = async (req, res) => {
    const actividad = await Actividad.findByPk(req.params.id);
    if (actividad) res.json(actividad);
    else res.status(404).send('Actividad no encontrada');
};

// Muestra el Html correspondiente para poder ver la información de la actividad
exports.verActividad = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/InformacionActividad.html'));
};