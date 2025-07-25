const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');


const PackLego = sequelize.define('PackLego', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    cantidad_total: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    manual_pdf: {
        type: DataTypes.STRING, // guardamos el nombre del archivo
        allowNull: true // no es obligatorio
    },
    kit_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'kits',
            key: 'id'
        }
    }
}, {
    tableName: 'PacksLego', // Nombre de la tabla en la base de datos
    timestamps: false
});



module.exports = PackLego;
