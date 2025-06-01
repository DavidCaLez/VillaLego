const path = require('path');
const { Resultado } = require('../Model/Relaciones');

const crearResultado = async (req, res) => {
    try {
        const { historia_usuario_id } = req.body;
        const fichero = req.file.filename;

        const resultado = await Resultado.create({
            historia_usuario_id,
            fichero
        });

        res.send('✅ Imagen subida correctamente');
    } catch (error) {
        console.error(error);
        res.status(500).send('❌ Error al subir la imagen');
    }
};

module.exports = { crearResultado };
