const Sprint = require('../Model/SprintModel');
const fs = require('fs');
const path = require('path');
const Backlog = require('../Model/BacklogModel');

exports.crearSprint = async (req, res) => {
    try {
        const grupoId = req.params.grupoId;
        const { objetivo } = req.body;

        // Validación del objetivo
        if (!objetivo || objetivo.trim() === '') {
            console.error('El objetivo no puede estar vacío');

            return res.status(400).json({
                error: 'El objetivo no puede estar vacío'
            });
        }

        console.log('Creando sprint para el grupo:', grupoId, 'con objetivo:', objetivo);

        // Crear el sprint usando el modelo
        const sprint = await Sprint.create({
            groupId: grupoId,
            objective: objetivo,
            burndownChart: [] // Array vacío por defecto
        });

        res.status(201).json({
            mensaje: 'Sprint creado correctamente',
            sprint: sprint
        });

    } catch (err) {
        console.log('Error al crear el sprint:', err);
        console.error('Error al crear el sprint:', err);
        res.status(500).json({
            error: 'Error interno al crear el sprint'
        });
    }
};

exports.subirBurndown = async (req, res) => {
    try {
        const { imagenBase64 } = req.body;
        const grupoId = req.params.grupoId;

        if (!imagenBase64 || !grupoId) {
            return res.status(400).json({ error: 'Faltan datos: imagen o grupoId' });
        }

        const resultadosDir = path.join(__dirname, '../uploads/resultados');
        if (!fs.existsSync(resultadosDir)) {
            fs.mkdirSync(resultadosDir, { recursive: true });
        }

        const base64Data = imagenBase64.replace(/^data:image\/png;base64,/, "");
        const fileName = `burndown_${grupoId}_${Date.now()}.png`;
        const filePath = path.join(resultadosDir, fileName);

        fs.writeFileSync(filePath, base64Data, 'base64');

        // Guardar imagen en Sprint
        const sprint = await Sprint.findOne({ where: { groupId: grupoId } });
        if (sprint) {
            sprint.burndownChart = fileName;
            await sprint.save();
        }

        // Guardar en backlog si validado por cliente
        const backlog = await Backlog.findOne({
            where: { grupo_id: grupoId, validadoCliente: true }
        });
        if (backlog) {
            backlog.imagen = fileName;
            await backlog.save();
        }

        res.status(200).json({ mensaje: 'Burndown chart subido correctamente', nombreArchivo: fileName });
    } catch (err) {
        console.error('Error al subir burndown chart:', err);
        res.status(500).json({ error: 'Error interno al subir burndown' });
    }
};


