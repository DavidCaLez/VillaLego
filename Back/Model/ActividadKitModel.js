const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');

const ActividadKit = sequelize.define('ActividadKit', {
    actividad_id: {
    type: DataTypes.INTEGER,
    references: { model: 'Actividades', key: 'id' }
    },
    kit_id: {
    type: DataTypes.INTEGER,
    references: { model: 'Kits', key: 'id' }
    },
    cantidad_asignada: {
    type: DataTypes.INTEGER,
    allowNull: false
    }
}, {
    tableName: 'ActividadKit',
    timestamps: false
});

module.exports = ActividadKit;