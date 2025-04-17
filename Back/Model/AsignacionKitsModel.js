// Model/AsignacionKitsModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');

const AsignacionKits = sequelize.define('AsignacionKits', {
    grupo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Grupos', key: 'id' }
    },
    actividad_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'ActividadKit', key: 'actividad_id' }
    },
    kit_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'ActividadKit', key: 'kit_id' }
    }
}, {
    tableName: 'AsignacionesKits',
    timestamps: false
});

module.exports = AsignacionKits;
