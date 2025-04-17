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
    tamaño_min_Grupos: {
    type: DataTypes.INTEGER,
    allowNull: false
    },
    tamaño_max_Grupos: {
    type: DataTypes.INTEGER,
    allowNull: false
    },
    profesor_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'Profesores',
            key: 'usuario_id'
        }
    }
}, {
    tableName: 'Actividades', // Nombre de la tabla en la base de datos
    timestamps: false
});


module.exports = Actividad;


