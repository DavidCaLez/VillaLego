exports.vista = (req, res) => {
    res.render('/Front/html/Alumno.html', { nombre: req.session.usuario.nombre });
    };