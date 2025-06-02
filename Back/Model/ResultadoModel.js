const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');

const Resultado = sequelize.define('Resultado', {
    backlog: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Backlogs',
            key: 'id'
        }
    },
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    imagen: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: false,
    tableName: 'Resultados' // Nombre de la tabla en la base de datos
});
module.exports = Resultado;