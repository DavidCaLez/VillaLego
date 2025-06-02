const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
//Configuracion de la base de datos
const sequelize = require('./config/Config_bd.env');

// Importa todos los modelos y relaciones
const { Usuario, Alumno, Profesor, Actividad, Kit, Grupo } = require('./Model/relaciones');//No sabemos si es necesario importar todos los modelos, pero por ahora lo dejamos así

//preload de creacion de administrador
const crearAdmin = require('./preload/crearAdmin');


// Rutas
const usuarioRoutes = require('./Routes/UsuarioRoutes');
const alumnoRoutes = require('./Routes/AlumnoRoutes');
const profesorRoutes = require('./Routes/ProfesorRoutes');
const actividadRoutes = require('./Routes/ActividadRoutes');
const kitRoutes = require('./Routes/KitRoutes');
const turnoRoutes = require('./Routes/TurnoRoutes');
const historiaUsuarioRoutes = require('./Routes/HistoriaUsuarioRoutes');
const packLegoRoutes = require('./Routes/PackLegoRoutes');
const grupoRoutes = require('./Routes/GrupoRoutes');
const backlogRoutes = require('./Routes/BacklogRoutes');
const rolRoutes = require('./Routes/RolRoutes');

const { t } = require('tar');
// preload de historias de usuario
const { preloadHistoriasUsuario } = require('./Controller/HistoriaUsuarioController');
//const modelos = require('./Model/relaciones'); // Importar modelos para crear las tablas en la base de datos

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());//nos permite leer el body de las peticiones en formato json
app.use(session({
    secret: 'clave-secreta',
    resave: false,
    saveUninitialized: false
}));

// 1) Carpeta real donde Multer deja las imágenes:
const historiasDir = path.resolve(__dirname, 'uploads', 'historias_usuario');
console.log('Sirviendo historias de usuario en:', historiasDir);

// 1) Asegurarnos de que las carpetas existen:
const uploadDirs = [
    path.join(__dirname, 'uploads'),
    path.join(__dirname, 'uploads/kits'),
    path.join(__dirname, 'uploads/manuales'),

];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`📁 Creada carpeta: ${dir}`);
    }
});

// 2) Servir los PDFs subidos como estáticos:
//    Kit PDFs  →  /uploads/kits/<filename>.pdf
//    Manuales   →  /uploads/manuals/<filename>.pdf
app.use(
    '/uploads/kits',
    express.static(path.join(__dirname, 'uploads/kits'))
);
app.use(
    '/uploads/manuales',
    express.static(path.join(__dirname, 'uploads/manuales'))
);
app.use(
    '/uploads/historias_usuario',
    express.static(historiasDir)
);

// Archivos estáticos (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../Front')));
app.use(express.json());

// Exponer usuario en todas las vistas (si usas lógica en frontend JS)
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../Front/html/Login.html'));
});

// Usar rutas
app.use('/', usuarioRoutes);
//app.use('/usuario', usuarioRoutes);
app.use('/alumno', alumnoRoutes);
app.use('/profesor', profesorRoutes);
app.use('/actividad', actividadRoutes);
app.use('/kit', kitRoutes);
app.use('/turno', turnoRoutes);
app.use('/historia-usuario', historiaUsuarioRoutes);
app.use('/pdfs', express.static(path.join(__dirname, '../pdfs')));
app.use('/packs', packLegoRoutes);
app.use('/grupos', grupoRoutes);
app.use('/backlog', backlogRoutes);
app.use('/rol', rolRoutes);


// Base de datos
sequelize.sync()
    .then(async () => {
        console.log('✅ Base de datos sincronizada correctamente');
        crearAdmin();
        //await preloadHistoriasUsuario(); // Preload de historias de usuario
    })
    .catch(err => console.error(err));


// Ruta de respaldo para favicon(crea el icono de la pesstaña del navegador)
app.get('/favicon.ico', (req, res) => {
    res.redirect('/img/lego-icon (1).png');
});


// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});