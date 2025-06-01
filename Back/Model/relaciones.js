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
const Rol = require('./RolModel');
const AsignacionKits = require('./AsignacionKitsModel');
const Backlog = require('./BacklogModel');
const Sprint = require('./SprintModel');

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
Grupo.hasMany(Rol, { foreignKey: 'grupo_id' });
Rol.belongsTo(Grupo, { foreignKey: 'grupo_id' });
Alumno.hasMany(Rol, { foreignKey: 'alumno_id' });
Rol.belongsTo(Alumno, { foreignKey: 'alumno_id' });

AsignacionKits.belongsTo(ActividadKit, { foreignKey: 'kit_id' });
AsignacionKits.belongsTo(Grupo, { foreignKey: 'grupo_id' });
AsignacionKits.belongsTo(Turno, { foreignKey: 'turno_id' });
Grupo.hasMany(AsignacionKits, { foreignKey: 'grupo_id' });
Turno.hasMany(AsignacionKits, { foreignKey: 'turno_id' });
ActividadKit.hasMany(AsignacionKits, { foreignKey: 'kit_id' });

ActividadKit.belongsTo(Kit, {
    foreignKey: 'kit_id',
    as: 'Kit'
});
Kit.hasMany(ActividadKit, {
    foreignKey: 'kit_id',
    as: 'actividadKits'
});
Alumno.hasMany(Backlog, { foreignKey: 'alumno_id' });
Backlog.belongsTo(Alumno, { foreignKey: 'alumno_id' });
Grupo.hasMany(Backlog, { foreignKey: 'grupo_id' });
Backlog.belongsTo(Grupo, { foreignKey: 'grupo_id' });
Grupo.hasMany(Sprint, { foreignKey: 'groupId' });
Sprint.belongsTo(Grupo, { foreignKey: 'groupId' });





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
