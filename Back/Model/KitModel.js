const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');


const Kit = sequelize.define('Kit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true
    },

    descripcion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    actividad_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Actividades',
            key: 'id'
        }
    }
}, 
{
    tableName: 'Kits', // Nombre de la tabla en la base de datos
    timestamps: false
});

module.exports = Kit;

