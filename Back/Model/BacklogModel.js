const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');

const Backlog = sequelize.define('Backlog', {
    id: {
    type: DataTypes.STRING,
    primaryKey: true
    },
    titulo: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    descripcion: {
    type: DataTypes.TEXT,
    allowNull: false
    },
    size: {
    type: DataTypes.INTEGER,
    allowNull: true  
    },
    priority: {
    type: DataTypes.INTEGER,
    allowNull: true  
    },
    completado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
    },
    validadoPO: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
    },
    validadoCliente: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
    },
    esMejora:{
    type: DataTypes.BOOLEAN,
    defaultValue: false
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    kit_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'kits', 
            key: 'id'
        },
        allowNull: false 
    },
    alumno_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'alumnos', 
            key: 'usuario_id'
        },
        allowNull: true
    },
    grupo_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'grupos', 
            key: 'id'
        },
        allowNull: false
    }

}, {
    tableName: 'historias_usuario',
    timestamps: false
});

module.exports = Backlog;
