const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');


const Profesor = sequelize.define('Profesor', {
    usuario_id: {
    type: DataTypes.INTEGER,
    references: { model: 'Usuarios', key: 'id' }
    }
}, 
{ timestamps: false, 
    tableName: 'Profesores' // Nombre de la tabla en la base de datos
});




module.exports = Profesor;
