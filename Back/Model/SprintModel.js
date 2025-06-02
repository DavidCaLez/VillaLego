const mongoose = require('mongoose');
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Group = require('./GroupModel');

const Sprint = sequelize.define('Sprint', {
    id: {
        type: DataTypes.STRING,
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
        type: DataTypes.JSON,
        defaultValue: []
    },
}, {
    timestamps: false,
    tableName: 'Sprints' // Nombre de la tabla en la base de datos
});

module.exports = Sprint;