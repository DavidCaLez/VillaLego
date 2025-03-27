const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');


const Actividad = sequelize.define('Actividad', {
    id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
    },
    nombre: {
    type: DataTypes.STRING,
    allowNull: false
    },
    fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
    },
    tamaño_min: {
    type: DataTypes.INTEGER,
    allowNull: false
    },
    tamaño_max: {
    type: DataTypes.INTEGER,
    allowNull: false
    },
    profesor_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Profesors',
            key: 'usuario_id'
        }
    }
}, {
    timestamps: false
});


module.exports = Actividad;


