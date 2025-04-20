//Comprueba los usuarios que tienen acceso a ciertas rutas

exports.soloAlumnos = (req, res, next) => {
    if (req.session.usuario) return next();
    // Guardar la ruta original a la que intentaba acceder
    req.session.redirectTo = req.originalUrl;
    res.redirect('/login');
};
    
exports.soloProfesores = (req, res, next) => {
    if (req.session.usuario) return next();
    res.status(403).send('Acceso denegado');
};