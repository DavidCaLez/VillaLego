const Usuario = require('../Model/UsuarioModel');
const Alumno = require('../Model/AlumnoModel');
const Profesor = require('../Model/ProfesorModel');
const Actividad = require('../Model/ActividadModel');


const path = require('path');

//Relacionado con Usuario
exports.dashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Profesor.html'));
};

const fs = require('fs');

exports.getCrearProfesor = async (req, res) => {
    const alumnos = await Alumno.findAll({ include: Usuario });

  // Cargar plantilla HTML y hacer reemplazo
    const templatePath = path.join(__dirname, '../../Front/html/CrearProfesor.html');
    const template = fs.readFileSync(templatePath, 'utf8');

  // Construir HTML con alumnos
    let listaHTML = '';
    for (const a of alumnos) {
    listaHTML += `
        <div class="alumno-card">
        <div>
            <strong>${a.Usuario.nombre}</strong><br>
            ${a.Usuario.correo}
            </div>
        <form action="/profesor/CrearProfesor" method="POST">
            <input type="hidden" name="usuario_id" value="${a.usuario_id}" />
            <button class="btn-ascender" type="submit">Ascender</button>
        </form>
        </div>
    `;
    }

  // Reemplazar marcador en plantilla
    const htmlFinal = template.replace('<!-- AQUI_VAN_LOS_ALUMNOS -->', listaHTML);
    res.send(htmlFinal);
};

// Crea un nuevo profesor a partir de un alumno solo si el correo contiene @upm.es, en caso 
// contrario no se le permite ascender y muestra un mensaje de error
exports.postCrearProfesor = async (req, res) => {
    const { usuario_id } = req.body;

    try {
        const usuario = await Usuario.findByPk(usuario_id);

        if (!usuario) {
            return res.redirect('/profesor/CrearProfesor?mensaje=Usuario%20no%20encontrado&tipo=error');
        }

        if (usuario.correo.includes('@upm.es')) {
            await Alumno.destroy({ where: { usuario_id } });
            await Profesor.create({ usuario_id });
            res.redirect('/profesor/CrearProfesor?mensaje=Alumno%20ascendido%20correctamente&tipo=exito');
        } else {
            const mensaje = 'Para crear un profesor, el correo debe contener "@upm.es"';
            res.redirect(`/profesor/CrearProfesor?mensaje=${encodeURIComponent(mensaje)}&tipo=error`);
        }
    } catch (error) {
        console.error('Error al ascender a profesor:', error);
        res.redirect('/profesor/CrearProfesor?mensaje=Error%20interno%20del%20servidor&tipo=error');
    }
};


//Relacionado con Actividad
exports.vistaCrear = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Actividad.html'));
};

exports.editarActividad = async (req, res) => {
    const { nombre, fecha, tamaño_min, tamaño_max } = req.body;
    await Actividad.update(
    { nombre, fecha, tamaño_min, tamaño_max },
    { where: { id: req.params.id } }
    );
    res.redirect('/actividad/crear');
};

exports.obtenerActividad = async (req, res) => {
    const actividad = await Actividad.findByPk(req.params.id);
    if (actividad) res.json(actividad);
    else res.status(404).send('Actividad no encontrada');
};

// Muestra el Html correspondiente para poder ver la información de la actividad
exports.verActividad = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/InformacionActividad.html'));
};

// Obtener datos del perfil como JSON
exports.obtenerPerfil = async (req, res) => {
    const usuarioId = req.session.usuario?.id;
    if (!usuarioId) return res.status(401).send('No autenticado');

    const usuario = await Usuario.findByPk(usuarioId);
    if (!usuario) return res.status(404).send('Usuario no encontrado');

    res.json({ nombre: usuario.nombre, correo: usuario.correo });
};

// Servir vista del perfil del profesor
exports.vistaPerfil = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/PerfilProfesor.html'));
};