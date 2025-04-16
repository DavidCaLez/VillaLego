const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');
const Grupo = sequelize.define('Grupo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    tamanio : {
        type: DataTypes.INTEGER,
        allowNull: false
    },

},
{ 
    tableName: 'Grupos', // Nombre de la tabla en la base de datos
    timestamps: false 
});

module.exports = Grupo;
    