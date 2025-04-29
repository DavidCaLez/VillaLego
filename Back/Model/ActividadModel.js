const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');
const cript = require('crypto');


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
    },
    token: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: () => {
            return cript.randomBytes(16).toString('hex'); // Genera un token aleatorio de 32 caracteres
        }
    },
}, {
    tableName: 'Actividades', // Nombre de la tabla en la base de datos
    timestamps: false
});


module.exports = Actividad;


