const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd');
const Usuario = require('./usuario');

const Alumno = sequelize.define('Alumno', {
    usuario_id: {
    type: DataTypes.INTEGER,
    references: { model: Usuario, key: 'id' }
    }
}, { timestamps: false });

Alumno.belongsTo(Usuario, { foreignKey: 'usuario_id' });

module.exports = Alumno;