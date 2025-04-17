const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env'); 
const Rol = sequelize.define('Rol', {
    id_Alumno: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        
    },
    id_Grupo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        references: { model: 'Grupos', key: 'id' }
    },
    rol:{ 
        type: DataTypes.ENUM('Scrum Master', 'Product owner','Desarrollador'),
        allowNull: false,
    }}, {
    tableName: 'Rol', // Nombre de la tabla en la base de datos 
    timestamps: false
    });
    module.exports = Rol; // Exportar el modelo para usarlo en otros archivos
    