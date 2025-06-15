// Model/AsignacionKitsModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');

const AsignacionKits = sequelize.define('AsignacionKits', {
    grupo_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Grupos', key: 'id' }
    },
    turno_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Turnos', key: 'id' }
    },
    kit_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Kits', key: 'id' }
    },
    actividad_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Actividades', key: 'id' }
    },
}, {
    tableName: 'AsignacionesKits',
    timestamps: false,
});

module.exports = AsignacionKits;
