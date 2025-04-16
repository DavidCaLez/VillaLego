// models/relaciones.js
const Usuario = require('./UsuarioModel');
const Alumno = require('./AlumnoModel');
const Profesor = require('./ProfesorModel');
const Actividad = require('./ActividadModel');
const Kit = require('./KitModel');
const ActividadKit = require('./ActividadKitModel');
const PackLego = require('./PackLegoModel');
const Turno = require('./TurnoModel');
const HistoriaUsuario = require('./HistoriaUsuarioModel');
const Grupo = require('./GrupoModel');

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

// Turno ↔ Actividad (suponiendo que un turno pertenece a una actividad)
Actividad.hasMany(Turno, { foreignKey: 'actividad_id' });
Turno.belongsTo(Actividad, { foreignKey: 'actividad_id' });

// Kit ↔ Historial (suponiendo que existe una relación uno a muchos)
Kit.hasMany(HistoriaUsuario, { foreignKey: 'kit_id', as: 'historias' });
HistoriaUsuario.belongsTo(Kit, { foreignKey: 'kit_id' });

Turno.hasMany(Grupo, { foreignKey: 'turno_id' });
Grupo.belongsTo(Turno, { foreignKey: 'turno_id' });

module.exports = {
    Usuario,
    Alumno,
    Profesor,
    Actividad,
    Kit,
    ActividadKit,
    PackLego,
    Turno,
    HistoriaUsuario,
    Grupo

};
