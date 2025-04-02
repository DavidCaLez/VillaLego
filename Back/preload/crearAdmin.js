const bcrypt = require('bcrypt');
const Usuario = require('../Model/UsuarioModel');
const Profesor = require('../Model/ProfesorModel');

async function crearAdmin() {
    const nombre = 'Administrador';
    const correo = 'administrador@upm.es';
    const contraseñaPlano = '0000';

    try {
    const existente = await Usuario.findOne({ where: { nombre } });

    if (!existente) {
        const hash = await bcrypt.hash(contraseñaPlano, 10);
        const nuevoUsuario = await Usuario.create({ nombre, correo, contraseña: hash });
        await Profesor.create({ usuario_id: nuevoUsuario.id });
        console.log('✅ Usuario "Administrador" creado como profesor');
    } else {
        console.log('ℹ️ El usuario "Administrador" ya existía');
    }
    } catch (err) {
    console.error('❌ Error al crear administrador:', err);
    }
}

module.exports = crearAdmin;
