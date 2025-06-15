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
const Resultado = require('./ResultadoModel');

// Usuario ↔ Alumno/Profesor (si se borra usuario, se borran sus roles)
Alumno.belongsTo(Usuario, { 
    foreignKey: 'usuario_id',
    onDelete: 'CASCADE' 
});
Profesor.belongsTo(Usuario, { 
    foreignKey: 'usuario_id',
    onDelete: 'CASCADE' 
});

// Profesor ↔ Actividad (si se borra profesor, sus actividades quedan huérfanas)
Profesor.hasMany(Actividad, { 
    foreignKey: 'profesor_id',
    onDelete: 'SET NULL' 
});
Actividad.belongsTo(Profesor, { 
    foreignKey: 'profesor_id',
    onDelete: 'SET NULL' 
});

// First define base model relationships
Actividad.hasMany(Turno, {
    foreignKey: 'actividad_id',
    onDelete: 'CASCADE'
});

Turno.hasMany(Grupo, {
    foreignKey: 'turno_id',
    onDelete: 'CASCADE'
});

// Define AsignacionKits relationships
AsignacionKits.belongsTo(Grupo, {
    foreignKey: 'grupo_id',
    onDelete: 'CASCADE'
});

AsignacionKits.belongsTo(Turno, {
    foreignKey: 'turno_id',
    onDelete: 'CASCADE'
});

AsignacionKits.belongsTo(ActividadKit, {
    foreignKey: 'kit_id',
    onDelete: 'CASCADE'
});

// Define ActivityKit relationships
Actividad.belongsToMany(Kit, {
    through: {
        model: ActividadKit,
        unique: false
    },
    foreignKey: 'actividad_id',
    onDelete: 'CASCADE' 
});
Kit.belongsToMany(Actividad, {
    through: {
        model: ActividadKit,
        unique: false
    },
    foreignKey: 'kit_id',
    onDelete: 'CASCADE'
});

// Kit ↔ PackLego (si se borra kit, se borran sus packs)
Kit.hasMany(PackLego, { 
    foreignKey: 'kit_id',
    as: 'packs',
    onDelete: 'CASCADE' 
});
PackLego.belongsTo(Kit, { 
    foreignKey: 'kit_id',
    onDelete: 'CASCADE' 
});

// Actividad ↔ Turno (si se borra actividad, se borran sus turnos)
Actividad.hasMany(Turno, { 
    foreignKey: 'actividad_id',
    onDelete: 'CASCADE' 
});
Turno.belongsTo(Actividad, { 
    foreignKey: 'actividad_id',
    onDelete: 'CASCADE' 
});

// Kit ↔ HistoriaUsuario
Kit.hasMany(HistoriaUsuario, { 
    foreignKey: 'kit_id',
    as: 'historias',
    onDelete: 'CASCADE' 
});
HistoriaUsuario.belongsTo(Kit, { 
    foreignKey: 'kit_id',
    onDelete: 'CASCADE' 
});

// Turno ↔ Grupo ↔ Rol
Turno.hasMany(Grupo, { 
    foreignKey: 'turno_id',
    onDelete: 'CASCADE' 
});
Grupo.belongsTo(Turno, { 
    foreignKey: 'turno_id',
    onDelete: 'CASCADE' 
});
Grupo.hasMany(Rol, { 
    foreignKey: 'grupo_id',
    onDelete: 'CASCADE' 
});
Rol.belongsTo(Grupo, { 
    foreignKey: 'grupo_id',
    onDelete: 'CASCADE' 
});

// Alumno ↔ Rol
Alumno.hasMany(Rol, { 
    foreignKey: 'alumno_id',
    onDelete: 'CASCADE' 
});
Rol.belongsTo(Alumno, { 
    foreignKey: 'alumno_id',
    onDelete: 'CASCADE' 
});

// ActividadKit relationships need to be defined before AsignacionKits
ActividadKit.belongsTo(Actividad, {
    foreignKey: 'actividad_id',
    onDelete: 'CASCADE'
});

ActividadKit.belongsTo(Kit, {
    foreignKey: 'kit_id',
    onDelete: 'CASCADE'
});

// AsignacionKits relationships (must be defined first)
AsignacionKits.belongsTo(Grupo, {
    foreignKey: 'grupo_id',
    onDelete: 'CASCADE'
});

AsignacionKits.belongsTo(Turno, {
    foreignKey: 'turno_id',
    onDelete: 'CASCADE'
});

AsignacionKits.belongsTo(ActividadKit, {
    foreignKey: 'kit_id',
    onDelete: 'CASCADE'
});

AsignacionKits.belongsTo(Actividad, {
    foreignKey: 'actividad_id',
    onDelete: 'CASCADE'
});

// Backlog y Sprint
Alumno.hasMany(Backlog, { 
    foreignKey: 'alumno_id',
    onDelete: 'SET NULL' 
});
Backlog.belongsTo(Alumno, { 
    foreignKey: 'alumno_id',
    onDelete: 'SET NULL' 
});
Grupo.hasMany(Backlog, { 
    foreignKey: 'grupo_id',
    onDelete: 'CASCADE' 
});
Backlog.belongsTo(Grupo, { 
    foreignKey: 'grupo_id',
    onDelete: 'CASCADE' 
});
Grupo.hasMany(Sprint, { 
    foreignKey: 'groupId',
    onDelete: 'CASCADE' 
});
Sprint.belongsTo(Grupo, { 
    foreignKey: 'groupId',
    onDelete: 'CASCADE' 
});

// Resultados
Backlog.hasMany(Resultado, { 
    foreignKey: 'backlog',
    onDelete: 'CASCADE' 
});
Resultado.belongsTo(Backlog, { 
    foreignKey: 'backlog',
    onDelete: 'CASCADE' 
});



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
    Grupo,
    Rol,
    AsignacionKits,
    Backlog,
    Sprint,
    Resultado
};
