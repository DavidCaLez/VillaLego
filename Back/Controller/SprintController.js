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
    const { grupoId } = req.params;
    if (!req.file) {
        return res.status(400).json({ error: "No se ha enviado ninguna imagen" });
    }

    try {
        const sprint = await Sprint.findOne({ where: { groupId: grupoId } });

        if (!sprint) return res.status(404).json({ error: "Sprint no encontrado" });

        sprint.burndownChart = "/uploads/resultados/" + req.file.filename;
        await sprint.save();

        res.json({ mensaje: "Imagen subida correctamente", ruta: sprint.burndownChart });
    } catch (error) {
        console.error("❌ Error al subir burndown:", error);
        res.status(500).json({ error: "Error interno al subir imagen" });
    }
};


