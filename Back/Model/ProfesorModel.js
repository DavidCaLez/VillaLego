const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');


const Profesor = sequelize.define('Profesor', {
    usuario_id: {
    type: DataTypes.INTEGER,
    references: { model: 'Usuarios', key: 'id' }
    }
}, { timestamps: false });




module.exports = Profesor;
// Crear al usuario por defecto 'hazmin' si no existe
const bcrypt = require('bcrypt');

(async () => {
    const Usuario = require('./UsuarioModel');
    const Profesor = require('./ProfesorModel');

    const nombre = 'Administrador';
    const correo = 'administrador@upm.es'; // Puedes cambiar el correo si lo deseas
    const contraseñaPlano = '0000';

    try {
    const existente = await Usuario.findOne({ where: { nombre } });

    if (!existente) {
        const hash = await bcrypt.hash(contraseñaPlano, 10);
        const nuevoUsuario = await Usuario.create({ nombre, correo, contraseña: hash });
        await Profesor.create({ usuario_id: nuevoUsuario.id });
        console.log('Usuario por defecto "Administrador" creado como profesor.');
    } else {
        console.log('El usuario "Administrador" ya existe.');
    }
    } catch (err) {
    console.error('Error al crear usuario por defecto:', err);
    }
})();


