const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');


const PackLego = sequelize.define('PackLego', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    nombre: {
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
