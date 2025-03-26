const path = require('path');
const Actividad = require('../Model/ActividadModel');
const Profesor = require('../Model/ProfesorModel');


exports.vistaDashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Actividad.html'));
};

exports.vistaCrear = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Actividad.html'));
};

exports.getActividades = async (req, res) => {
    const actividades = await Actividad.findAll();
    res.json(actividades);
};

// Crea la actividad con el profesor logueado como creador de la actividad
exports.crearActividad = async (req, res) => {
    try {
        const { nombre, fecha, tamaño_min, tamaño_max } = req.body;

        // Validación lógica de tamaños

        // Buscar al profesor correspondiente al usuario logueado
        const profesor = await Profesor.findOne({ where: { usuario_id: req.session.usuario.id } });

        // Validación por si no se encuentra profesor
        if (!profesor) {
            return res.status(404).send('Profesor no encontrado para este usuario');
        }

        // Crear actividad incluyendo el ID del profesor
        await Actividad.create({
            nombre,
            fecha,
            tamaño_min,
            tamaño_max,
            profesor_id: profesor.usuario_id
        });

        res.redirect('/profesor/dashboard');
    } catch (err) {
        console.error("Error al crear la actividad:", err);
        res.status(500).send("No se pudo crear la actividad");
    }
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
    res.redirect('/actividad/crear');
};
