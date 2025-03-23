const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');
const Usuario = require('./UsuarioModel');

const Alumno = sequelize.define('Alumno', {
    usuario_id: {
    type: DataTypes.INTEGER,
    references: { model: Usuario, key: 'id' }
    }
}, { timestamps: false });

Alumno.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = Alumno;