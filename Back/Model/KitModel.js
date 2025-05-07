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
    archivo_pdf: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, 
{
    tableName: 'Kits', // Nombre de la tabla en la base de datos
    timestamps: false
});

module.exports = Kit;

