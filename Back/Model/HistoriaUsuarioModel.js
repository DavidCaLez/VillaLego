const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');

const HistoriaUsuario = sequelize.define('HistoriaUsuario', {
    id: {
    type: DataTypes.STRING,
    primaryKey: true
    },
    descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
    },
    size: {
    type: DataTypes.INTEGER,
    allowNull: true  
    },
    priority: {
    type: DataTypes.INTEGER,
    allowNull: true  
    },
    completado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
    },
    validadoPO: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
    },
    validadoCliente: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
    },
    esMejora: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
    }
}, {
    tableName: 'historias_usuario',
    timestamps: false
});

module.exports = HistoriaUsuario;
