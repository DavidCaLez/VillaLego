const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');
const { table } = require('console');
//const Usuario = require('./UsuarioModel');


const Alumno = sequelize.define('Alumno', {
    usuario_id: {
    type: DataTypes.INTEGER,
    references: { model: 'Usuarios', key: 'id' }
    }
}, 
{ 
    tableName: 'Alumnos', // Nombre de la tabla en la base de datos
    timestamps: false 
});



module.exports = Alumno;