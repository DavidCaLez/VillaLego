const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env'); 

const Turno = sequelize.define('Turno', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    hora: {
        type: DataTypes.TIME,
        allowNull: false,
    },
    fase: {
        type: DataTypes.ENUM('Presentacion', 'Lectura instrucciones', 'Priorizacion de la pila del producto','Planificacion del sprint', 
            'Ejecucion del sprint','Revision del sprint','Retrospectiva del sprint'), //TODO: En la ejecucion del srint se hara una reunion cada 10 minutos.
        allowNull: false,
    },
}, {
    tableName: 'Turnos', 
    timestamps: false,  
});

module.exports = Turno;