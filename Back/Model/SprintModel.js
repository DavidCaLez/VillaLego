

const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');

const Sprint = sequelize.define('Sprint', {
    id: {
        type: DataTypes.INTEGER,

        primaryKey: true,
        allowNull: false,
        unique: true,
        autoIncrement: true
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Grupos',
            key: 'id'
        }
    },
    objective: {
        type: DataTypes.STRING,
        allowNull: false
    },
    burndownChart: {
        type: DataTypes.STRING,
        
    },
}, {
    timestamps: false,
    tableName: 'Sprints' // Nombre de la tabla en la base de datos
});

module.exports = Sprint;