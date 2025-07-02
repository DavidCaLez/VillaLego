const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');

const HistoriaUsuario = sequelize.define('HistoriaUsuario', {
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
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    },
    kit_id: {
        type: DataTypes.INTEGER,
        references: {
            model: 'kits', // el nombre de la tabla en la BD
            key: 'id'
        },
        allowNull: false // o true si quieres que no sea obligatoria
    }
}, {
    tableName: 'historias_usuario',
    timestamps: false
});

module.exports = HistoriaUsuario;
