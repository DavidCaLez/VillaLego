const path = require('path');
const Actividad = require('../Model/ActividadModel');
const Kit = require('../Model/KitModel');

exports.crearKit = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        const actividad_id = req.session.actividadId;
        

        // Crear kit incluyendo el ID de la actividad
        await Kit.create({
            nombre,
            descripcion,
            actividad_id: actividad_id
        }); 

        res.redirect('/profesor/dashboard');
    } catch (err) {
        console.error("Error al crear el kit:", err);
        res.status(500).send("No se pudo crear el kit");
    }


}
exports.vistaCrear = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Kit.html'));
}