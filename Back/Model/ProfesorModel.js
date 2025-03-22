const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd');
const Usuario = require('./UsuarioModel');

const Profesor = sequelize.define('Profesor', {
    usuario_id: {
    type: DataTypes.INTEGER,
    references: { model: Usuario, key: 'id' }
    }
}, { timestamps: false });

Profesor.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = Profesor;