const Sprint = require('../Model/SprintModel');

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