const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
//Configuracion de la base de datos
const sequelize = require('./config/Config_bd.env');

// Importa todos los modelos y relaciones
const { Usuario, Alumno, Profesor, Actividad, Kit } = require('./Model/Relaciones');

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
app.use('/alumno', alumnoRoutes);
app.use('/profesor', profesorRoutes);
app.use('/actividad', actividadRoutes);
app.use('/kit', kitRoutes);
app.use('/turno',turnoRoutes);
app.use('/historia-usuario', historiaUsuarioRoutes);

// Base de datos
sequelize.sync()
    .then(async () => {
        console.log('✅ Base de datos sincronizada correctamente');
        crearAdmin();
        await preloadHistoriasUsuario(); // Preload de historias de usuario
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