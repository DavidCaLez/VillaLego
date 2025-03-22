const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/Config_bd');

// Rutas
const usuarioRoutes = require('./Routes/UsuarioRoutes');
const alumnoRoutes = require('./Routes/AlumnoRoutes');
const profesorRoutes = require('./Routes/ProfesorRoutes');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
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

// Base de datos
sequelize.sync()
    .then(() => console.log('Base de datos conectada y sincronizada'))
    .catch(err => console.error(err));

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});