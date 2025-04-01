const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/Config_bd.env');

// Importa todos los modelos y relaciones
const { Usuario, Alumno, Profesor, Actividad, Kit } = require('./Model/Relaciones');

//preload de creacion de administrador
const crearAdmin = require('./preload/crearAdmin');
crearAdmin();

// Rutas
const usuarioRoutes = require('./Routes/UsuarioRoutes');
const alumnoRoutes = require('./Routes/AlumnoRoutes');
const profesorRoutes = require('./Routes/ProfesorRoutes');
const actividadRoutes = require('./Routes/ActividadRoutes');
const kitRoutes = require('./Routes/KitRoutes');
const turnoRoutes = require('./Routes/TurnoRoutes'); 
const { t } = require('tar');
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

// Exponer usuario en todas las vistas (si usas lógica en frontend JS)
app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

// Usar rutas
app.use('/', usuarioRoutes);
app.use('/alumno', alumnoRoutes);
app.use('/profesor', profesorRoutes);
app.use('/actividad', actividadRoutes);
app.use('/kit', kitRoutes);
app.use('/turno',turnoRoutes);

// Base de datos
sequelize.sync()
    .then(() => console.log('Base de datos conectada y sincronizada'))
    .catch(err => console.error(err));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});