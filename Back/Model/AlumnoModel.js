const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');
//const Usuario = require('./UsuarioModel');


const Alumno = sequelize.define('Alumno', {
    usuario_id: {
    type: DataTypes.INTEGER,
    references: { model: 'Usuarios', key: 'id' }
    }
}, { timestamps: false });



module.exports = Alumno;