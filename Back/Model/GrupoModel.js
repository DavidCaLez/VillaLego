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
    turno_id: {
        type: DataTypes.INTEGER,
        references: { model: 'Turnos', key: 'id' }
    }

},
{ 
    tableName: 'Grupos', // Nombre de la tabla en la base de datos
    timestamps: false 
});

module.exports = Grupo;
    