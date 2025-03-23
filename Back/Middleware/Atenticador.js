//Comprueba los usuarios que tienen acceso a ciertas rutas
exports.soloHazmin = (req, res, next) => {
    if (req.session.usuario?.nombre === 'hazmin') return next();
    res.status(403).send('Acceso solo para hazmin');
};
    
exports.soloAlumnos = (req, res, next) => {
    if (req.session.usuario) return next();
    res.status(403).send('Acceso denegado');
};
    
exports.soloProfesores = (req, res, next) => {
    if (req.session.usuario) return next();
    res.status(403).send('Acceso denegado');
};