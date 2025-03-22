const path = require('path');

exports.dashboard = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/Alumno.html'));
};