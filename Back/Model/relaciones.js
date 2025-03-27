// models/relaciones.js
const Usuario = require('./UsuarioModel');
const Alumno = require('./AlumnoModel');
const Profesor = require('./ProfesorModel');
const Actividad = require('./ActividadModel');
const Kit = require('./KitModel');

// Relaciones

// Usuario ↔ Alumno / Profesor
Alumno.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Profesor.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Profesor ↔ Actividad
Profesor.hasMany(Actividad, { foreignKey: 'profesor_id' });
Actividad.belongsTo(Profesor, { foreignKey: 'profesor_id' });

// Actividad ↔ Kit
Actividad.hasMany(Kit, { foreignKey: 'actividad_id' });
Kit.belongsTo(Actividad, { foreignKey: 'actividad_id' });

module.exports = {
    Usuario,
    Alumno,
    Profesor,
    Actividad,
    Kit
};
