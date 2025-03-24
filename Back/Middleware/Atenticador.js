//Comprueba los usuarios que tienen acceso a ciertas rutas
exports.soloPadmin = (req, res, next) => {
    if (req.session.usuario?.nombre === 'Administrador') return next();
    res.status(403).send('Acceso solo para Administrador');
};
    
exports.soloAlumnos = (req, res, next) => {
    if (req.session.usuario) return next();
    res.status(403).send('Acceso denegado');
};
    
exports.soloProfesores = (req, res, next) => {
    if (req.session.usuario) return next();
    res.status(403).send('Acceso denegado');
};