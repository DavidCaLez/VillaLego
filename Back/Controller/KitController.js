const path = require('path');
const Actividad = require('../Model/ActividadModel');
const Kit = require('../Model/KitModel');
const PackLego = require('../Model/PackLegoModel');

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

exports.listarKits = async (req, res) => {
    try {
        const kits = await Kit.findAll({
            include: [{ model: PackLego, as: 'packs' }]
        });

        // Convertimos los PDFs de BLOB a base64
        const kitsConPDF = kits.map(kit => ({
            id: kit.id,
            nombre: kit.nombre,
            descripcion: kit.descripcion,
            pdf: kit.archivo_pdf ? Buffer.from(kit.archivo_pdf).toString('base64') : null,
            packs: kit.packs.map(pack => ({
                nombre: pack.nombre,
                descripcion: pack.descripcion,
                cantidad_total: pack.cantidad_total
            }))
        }));

        res.json(kitsConPDF);
    } catch (err) {
        console.error("Error al listar kits:", err);
        res.status(500).json({ error: "Error al listar kits" });
    }
}

// Función para ver el PDF del kit
exports.verPDF = async (req, res) => {
    try {
        const kit = await Kit.findByPk(req.params.id);
        if (!kit || !kit.archivo_pdf) {
            return res.status(404).send("PDF no encontrado");
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.send(kit.archivo_pdf);
    } catch (err) {
        console.error("Error al obtener el PDF:", err);
        res.status(500).send("Error interno");
    }
};
