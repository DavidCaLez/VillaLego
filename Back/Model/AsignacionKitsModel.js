const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env'); 
const AsignacionKits = sequelize.define('AsignacionKits', {
    id_Grupo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Grupos', key: 'id' }
        
    },
    id_Turno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Turnos', key: 'id' }
    },
    id_ActividadKit: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'ActividadKits', key: 'id' }
    },
 }, {
    tableName: 'AsignacionesKits', // Nombre de la tabla en la base de datos 
    timestamps: false
    });
    module.exports = AsignacionKits; // Exportar el modelo para usarlo en otros archivos