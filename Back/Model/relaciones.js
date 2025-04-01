// models/relaciones.js
const Usuario = require('./UsuarioModel');
const Alumno = require('./AlumnoModel');
const Profesor = require('./ProfesorModel');
const Actividad = require('./ActividadModel');
const Kit = require('./KitModel');
const ActividadKit = require('./ActividadKitModel');
const PackLego = require('./PackLegoModel');


// Relaciones

// Usuario ↔ Alumno / Profesor
Alumno.belongsTo(Usuario, { foreignKey: 'usuario_id' });
Profesor.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// Profesor ↔ Actividad
Profesor.hasMany(Actividad, { foreignKey: 'profesor_id' });
Actividad.belongsTo(Profesor, { foreignKey: 'profesor_id' });

// Actividad ↔ Kit (creando una tabla intermedia debido a la relación muchos a muchos)
Actividad.belongsToMany(Kit, { through: ActividadKit, foreignKey: 'actividad_id' });
Kit.belongsToMany(Actividad, {
    through: ActividadKit,
    foreignKey: 'kit_id'
    });

// Kit ↔ PackLego (suponiendo que existe una relación uno a muchos)
Kit.hasMany(PackLego, { foreignKey: 'kit_id', as: 'packs' });
PackLego.belongsTo(Kit, { foreignKey: 'kit_id' });

module.exports = {
    Usuario,
    Alumno,
    Profesor,
    Actividad,
    Kit,
    ActividadKit,
    PackLego
};
