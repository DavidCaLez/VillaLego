const { DataTypes } = require('sequelize');
const sequelize = require('../config/Config_bd.env');
const Rol = sequelize.define('Rol', {
    alumno_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Alumnos', key: 'id' }
    },
    grupo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Grupos', key: 'id' }
    },
    rol: {
        type: DataTypes.ENUM('Scrum Master', 'Product owner', 'Desarrollador'),
        allowNull: false,
    }
}, {
    tableName: 'Rol', // Nombre de la tabla en la base de datos 
    timestamps: false
});
module.exports = Rol; // Exportar el modelo para usarlo en otros archivos
