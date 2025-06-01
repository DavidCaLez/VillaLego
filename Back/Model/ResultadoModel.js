const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');
const Resultado = sequelize.define('Rol', {
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true // Definir como clave primaria
    },
    fichero: {
        type: DataTypes.STRING,
        allowNull: false,

    },
    historia_usuario_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'Resultado', // Nombre de la tabla en la base de datos 
    timestamps: false
});
module.exports = Resultado; // Exportar el modelo para usarlo en otros archivos