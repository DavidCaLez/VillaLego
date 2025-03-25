const path = require('path');
const Actividad = require('../Model/ActividadModel');

exports.vistaDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Actividad.html'));
};

exports.vistaCrear = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/CrearActividad.html'));
};

exports.getActividades = async (req, res) => {
    const actividades = await Actividad.findAll();
    res.json(actividades);
};

exports.crearActividad = async (req, res) => {
    const { nombre, fecha, tamaño_min, tamaño_max } = req.body;
    await Actividad.create({ nombre, fecha, tamaño_min, tamaño_max });
    res.redirect('/actividad/dashboard');
};

exports.obtenerActividad = async (req, res) => {
    const actividad = await Actividad.findByPk(req.params.id);
    if (actividad) res.json(actividad);
    else res.status(404).send('Actividad no encontrada');
};

exports.editarActividad = async (req, res) => {
    const { nombre, fecha, tamaño_min, tamaño_max } = req.body;
    await Actividad.update(
    { nombre, fecha, tamaño_min, tamaño_max },
    { where: { id: req.params.id } }
    );
    res.redirect('/actividad/dashboard');
};
