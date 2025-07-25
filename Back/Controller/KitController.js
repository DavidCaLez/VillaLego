const path = require('path');
const Kit = require('../Model/KitModel');
const PackLego = require('../Model/PackLegoModel');
const ActividadKit = require('../Model/ActividadKitModel');
const sequelize = require('../config/Config_bd.env');
const AsignacionKits = require('../Model/AsignacionKitsModel');
const Turno = require('../Model/TurnoModel');
const Grupo = require('../Model/GrupoModel');
const Actividad = require('../Model/ActividadModel');
const Rol = require('../Model/RolModel');


// Funcion que devuelve todos los kits existentes en la base de datos
exports.listarKits = async (req, res) => {
    try {
        const kits = await Kit.findAll({
            include: [{ model: PackLego, as: 'packs' }]
        });

        const kitsConPDF = kits.map(kit => ({
            id: kit.id,
            nombre: kit.nombre,
            descripcion: kit.descripcion,
            // Aquí el filename que guardó Multer:
            archivo_pdf: kit.archivo_pdf || null,
            packs: kit.packs.map(pack => ({
                codigo: pack.codigo,
                descripcion: pack.descripcion,
                cantidad_total: pack.cantidad_total
            }))
        }));

        res.json(kitsConPDF);
    } catch (err) {
        console.error("Error al listar kits:", err);
        res.status(500).json({ error: "Error al listar kits" });
    }
}

// Función para ver el PDF del kit, recuperando el archivo PDF de la base de datos
exports.verPDF = async (req, res) => {
    try {
        const kit = await Kit.findByPk(req.params.id);
        if (!kit?.archivo_pdf) return res.status(404).send("PDF no encontrado");

        const filePath = path.join(__dirname, '../uploads/kits', kit.archivo_pdf);
        return res.sendFile(filePath);
    } catch (err) {
        console.error("Error al obtener el PDF:", err);
        res.status(500).send("Error interno");
    }
};

// Vista HTML, redirige a la página de ver kits
exports.vistaKitsDeActividad = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/VerKits.html'));
};

// API JSON, nos ayuda a obtener los kits de una actividad determinada
exports.obtenerKitsDeActividad = async (req, res, next) => {
    const actividadId = req.params.actividadId;

    try {
        // 1) Traer relaciones actividad–kit, incluyendo Kit y sus packs
        const relaciones = await ActividadKit.findAll({
            where: { actividad_id: actividadId },
            include: [{
                model: Kit,
                as: 'Kit',                  // coincide con belongsTo(Kit, as: 'Kit')
                include: [{
                    model: PackLego,
                    as: 'packs'               // coincide con Kit.hasMany(PackLego, as: 'packs')
                }]
            }]
        });

        // 2) Para cada relación, sumar cuántas asignaciones hay por turno
        const kitsConInfo = await Promise.all(relaciones.map(async rel => {
            // rel.Kit existe gracias al include y alias 'Kit'
            const kit = rel.Kit.toJSON();

            // Contar filas en AsignacionKits (cada fila = 1 kit asignado)
            const asignPorTurno = await AsignacionKits.findAll({
                where: { kit_id: rel.kit_id },
                attributes: [
                    'turno_id',
                    [sequelize.fn('COUNT', sequelize.col('turno_id')), 'cantidad_por_turno']
                ],
                group: ['turno_id']
            });

            return {
                id: kit.id,
                nombre: kit.nombre,
                descripcion: kit.descripcion,
                // packs viene del include
                packs: kit.packs.map(p => ({
                    id: p.id,
                    codigo: p.codigo,
                    descripcion: p.descripcion,
                    cantidad_total: p.cantidad_total
                })),
                // valor global asignado en ActividadKit
                cantidad_asignada: rel.cantidad_asignada,
                // detalle por turno (recuento de filas)
                asignaciones: asignPorTurno.map(a => ({
                    turnoId: a.get('turno_id'),
                    cantidad: parseInt(a.get('cantidad_por_turno'), 10) || 0
                }))
            };
        }));

        res.json(kitsConInfo);

    } catch (error) {
        next(error);
    }
};

// Función para enviar la vista de edición de kits
exports.vistaEditarKits = async (req, res) => {
    const actividadId = +req.params.actividadId;

    try {
        // 1. Buscar un turno de esta actividad
        const turno = await sequelize.query(
            'SELECT t.id AS turnoId, g.id AS grupoId ' +
            'FROM Turnos t JOIN Grupos g ON g.turno_id = t.id ' +
            'WHERE t.actividad_id = ? LIMIT 1',
            {
                replacements: [actividadId],
                type: sequelize.QueryTypes.SELECT
            }
        );

        if (!turno.length || !turno[0].grupoId) {
            return res.status(404).send('❌ No se encontró ningún grupo para esta actividad.');
        }

        const grupoId = turno[0].grupoId;

        // 2. Devolver el HTML con grupoId embebido
        res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Editar Kits Asignados</title>
  <link rel="stylesheet" href="/css/styleEditarKits.css">
</head>
<body>
  <h1>Editar Kits Asignados</h1>

  <input type="hidden" id="actividadId" value="${actividadId}">
  <input type="hidden" id="grupoId" value="${grupoId}">

  <div id="kits-container"></div>

  <div class="button-group">
    <button id="btnAgregarKit" class="agregar-btn">Agregar Kit</button>
    <button id="btnGuardar" class="guardar-btn">Guardar</button>
    <button id="btnVolver" class="boton-volver">Volver</button>
  </div>

  <script src="/javascript/scriptEditarKits.js"></script>
</body>
</html>
    `);

    } catch (err) {
        console.error('❌ Error en vistaEditarKits:', err);
        res.status(500).send('Error interno al cargar la vista de edición de kits.');
    }
};
// Función para procesar la edición de kits (incluye actualización en tabla PackLego)
exports.editarKits = async (req, res, next) => {
    const actividadId = +req.params.actividadId;
    const kits = req.body.kits;
    const t = await sequelize.transaction();

    try {
        console.log(`🟡 Iniciando edición de kits para actividad ${actividadId}`);

        // 1. Validar stock disponible por kit
        for (const k of kits) {
            const stockTotal = await PackLego.sum('cantidad_total', {
                where: { kit_id: k.kit_id },
                transaction: t
            });

            const cantidadSolicitada = k.turnos.reduce((suma, t) => suma + t.cantidad, 0);

            console.log(`🔍 Kit ${k.kit_id}: cantidad solicitada = ${cantidadSolicitada}, stock disponible = ${stockTotal}`);

            if (cantidadSolicitada > stockTotal) {
                await t.rollback();
                return res.status(400).json({
                    error: `El kit con ID ${k.kit_id} excede su stock disponible (${stockTotal}).`
                });
            }
        }

        // 2. Eliminar AsignacionKits y Grupos antiguos asociados a los turnos de esta actividad
        const turnosActividad = await Turno.findAll({
            where: { actividad_id: actividadId },
            attributes: ['id'],
            transaction: t
        });
        const turnoIds = turnosActividad.map(t => t.id);

        console.log(`🧽 Eliminando asignaciones y grupos antiguos de turnos: ${turnoIds.join(', ')}`);

        await AsignacionKits.destroy({
            where: {
                turno_id: turnoIds
            },
            transaction: t
        });

        await Grupo.destroy({
            where: {
                turno_id: turnoIds
            },
            transaction: t
        });

        // 3. Detectar kits eliminados
        const inputKitIds = kits.map(k => k.kit_id);
        const existentes = await ActividadKit.findAll({
            where: { actividad_id: actividadId },
            transaction: t
        });
        const existingKitIds = existentes.map(r => r.kit_id);
        const kitsAEliminar = existingKitIds.filter(id => !inputKitIds.includes(id));

        if (kitsAEliminar.length) {
            console.log(`🗑 Eliminando kits quitados: [${kitsAEliminar.join(', ')}]`);
            await ActividadKit.destroy({
                where: {
                    actividad_id: actividadId,
                    kit_id: kitsAEliminar
                },
                transaction: t
            });
        }

        // 4. Crear o actualizar relaciones ActividadKit
        await ActividadKit.bulkCreate(
            kits.map(k => ({
                actividad_id: actividadId,
                kit_id: k.kit_id,
                cantidad_asignada: k.cantidad_asignada
            })),
            {
                transaction: t,
                updateOnDuplicate: ['cantidad_asignada']
            }
        );

        // 5. Obtener el tamaño de grupo para esta actividad
        const actividad = await Actividad.findByPk(actividadId, { transaction: t });
        if (!actividad) {
            await t.rollback();
            return res.status(404).json({ error: "Actividad no encontrada" });
        }
        const tamanioGrupo = actividad.tamaño_max_Grupos;

        // 6. Crear grupos nuevos y sus asignaciones
        for (const k of kits) {
            for (const turno of k.turnos) {
                const turnoId = turno.turnoId;
                const cantidad = turno.cantidad;

                if (cantidad === 0) continue;

                for (let i = 0; i < cantidad; i++) {
                    const nuevoGrupo = await Grupo.create({
                        tamanio: tamanioGrupo,
                        turno_id: turnoId
                    }, { transaction: t });

                    await AsignacionKits.create({
                        grupo_id: nuevoGrupo.id,
                        turno_id: turnoId,
                        kit_id: k.kit_id,
                        actividad_id: actividadId
                    }, { transaction: t });

                    console.log(`✅ Creado grupo_id=${nuevoGrupo.id} para kit=${k.kit_id}, turno=${turnoId}`);
                }
            }
        }

        await t.commit();
        console.log(`✅ Edición de kits para actividad ${actividadId} finalizada correctamente`);
        return res.json({ success: true, redirectTo: '/profesor/dashboard' });

    } catch (err) {
        await t.rollback();
        console.error('🛑 Error durante la edición de kits:', err);
        return next(err);
    }
};



exports.vistaAsignarKits = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/asignarKits.html'));
};

const { crearPackUnico } = require('./PackLegoController'); // Agregar al inicio

exports.vistaCrearKit = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/CrearKit.html'));
};

exports.crearKit = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { nombre, descripcion, pack_descripcion, cantidad_total } = req.body;
        // 1) Código(s) de pack: array o string único
        const packCodigos = Array.isArray(req.body.pack_codigo)
            ? req.body.pack_codigo
            : [req.body.pack_codigo];

        // 2) PDFs subidos por multer.fields()
        //    -> req.files['archivo_pdf'] es un array de 1 elemento
        //    -> req.files['pack_manual'] es un array paralelo a packCodigos
        const kitPdfFile = req.files['archivo_pdf']?.[0]?.filename || null;
        const manuales = req.files['pack_manual'] || [];

        // Validación…
        if (!nombre || !descripcion || packCodigos.length === 0
            || !pack_descripcion
            || !cantidad_total || parseInt(cantidad_total, 10) <= 0) {
            await t.rollback();
            return res.status(400).send("Todos los campos son obligatorios…");
        }

        // 3) Creo el Kit
        const nuevoKit = await Kit.create({
            nombre,
            descripcion,
            // si tu modelo sigue usando BLOB, haz fs.readFileSync aquí en lugar de filename
            archivo_pdf: kitPdfFile
        }, { transaction: t });

        // 4) Creo cada PackLego dentro de un bucle donde i está correctamente declarado
        for (let i = 0; i < packCodigos.length; i++) {
            const codigo = packCodigos[i];
            const manualFile = manuales[i]?.filename || null;

            await PackLego.create({
                codigo,
                descripcion: pack_descripcion,
                cantidad_total: parseInt(cantidad_total, 10),
                kit_id: nuevoKit.id,
                manual_pdf: manualFile     // tu nueva columna en el modelo
            }, { transaction: t });
        }

        await t.commit();
        res.redirect('/profesor/dashboard');
    } catch (err) {
        if (t) await t.rollback();
        console.error("🛑 Error al crear el kit y su pack:", err);
        res.status(500).send("Error interno al crear el kit y el pack");
    }
};

exports.vistaListadoKitsEditar = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/ListadoKits.html'));
};

exports.getEditarKit = async (req, res) => {
    try {
        const kit = await Kit.findByPk(req.params.kitId, {
            include: [{ model: PackLego, as: 'packs' }]
        });

        if (!kit) return res.status(404).json({ error: 'Kit no encontrado' });

        res.json({
            id: kit.id,
            nombre: kit.nombre,
            descripcion: kit.descripcion,
            // añadimos el filename que guardó Multer
            archivo_pdf: kit.archivo_pdf,
            packs: kit.packs.map(p => ({
                id: p.id,
                codigo: p.codigo,
                descripcion: p.descripcion,
                cantidad_total: p.cantidad_total,
                manual_pdf: p.manual_pdf
            }))
        });
    } catch (err) {
        console.error('Error al obtener kit para edición:', err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


/*
  FORM‑DATA esperado
  ───────────────────────────────────────────────────
  nombre, descripcion              (del kit)          ← opcionales
  pack_codigo[]                    (códigos packs)    ← al menos 1
  pack_descripcion[]               (descripciones)    ← opcional
  cantidad_total[]                 (cantidades)       ← opcional
  manual_codigo                    (código del pack cuyo PDF se manda) ← opcional
  pack_manual (file)               (el único PDF)     ← opcional
  archivo_pdf (file)               (PDF del kit)      ← opcional
*/
exports.postEditarKit = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const kitId = req.params.kitId;
        if (!kitId) return res.status(400).json({ error: 'Falta kitId' });

        /* 1. Arrays del formulario */
        const codigos = Array.isArray(req.body.pack_codigo)
            ? req.body.pack_codigo.filter(c => c?.trim())
            : [req.body.pack_codigo].filter(c => c?.trim());

        const descs = Array.isArray(req.body.pack_descripcion)
            ? req.body.pack_descripcion
            : req.body.pack_descripcion !== undefined ? [req.body.pack_descripcion] : [];

        const cants = Array.isArray(req.body.cantidad_total)
            ? req.body.cantidad_total
            : req.body.cantidad_total !== undefined ? [req.body.cantidad_total] : [];

        if (codigos.length === 0) {
            return res.status(400).json({ error: 'Debe haber al menos un pack' });
        }

        /* 2. Archivos subidos (máximo uno por tipo) */
        const nuevoKitPdf = req.files?.archivo_pdf?.[0]?.filename || null;
        const nuevoPackPdf = req.files?.pack_manual?.[0]?.filename || null;
        const codigoDelPdf = req.body.manual_codigo || codigos[0];   // fallback: 1er pack

        /* 3. Actualizar el propio kit */
        const kit = await Kit.findByPk(kitId, { transaction: t });
        if (!kit) return res.status(404).json({ error: 'Kit no encontrado' });

        await kit.update({
            nombre: req.body.nombre ?? kit.nombre,
            descripcion: req.body.descripcion ?? kit.descripcion,
            archivo_pdf: nuevoKitPdf || kit.archivo_pdf
        }, { transaction: t });

        /* 4. Packs: crear / actualizar / eliminar */
        const existentes = await PackLego.findAll({ where: { kit_id: kitId }, transaction: t });
        const map = {}; existentes.forEach(p => { map[p.codigo] = p; });

        const tocados = new Set();

        for (let i = 0; i < codigos.length; i++) {
            const codigo = codigos[i];
            const desc = descs[i] !== undefined && descs[i] !== '' ? descs[i] : map[codigo]?.descripcion || '';
            const cant = cants[i] !== undefined && cants[i] !== '' ? parseInt(cants[i], 10) : map[codigo]?.cantidad_total;

            const pdfParaEstePack = (codigo === codigoDelPdf && nuevoPackPdf) ? nuevoPackPdf : null;

            if (map[codigo]) {            /* UPDATE */
                await map[codigo].update({
                    descripcion: desc,
                    cantidad_total: cant,
                    manual_pdf: pdfParaEstePack || map[codigo].manual_pdf
                }, { transaction: t });
            } else {                      /* CREATE */
                await PackLego.create({
                    codigo,
                    descripcion: desc,
                    cantidad_total: cant ?? 0,
                    manual_pdf: pdfParaEstePack,
                    kit_id: kitId
                }, { transaction: t });
            }
            tocados.add(codigo);
        }

        /* Eliminar packs que el usuario quitó del formulario */
        for (const codigo of Object.keys(map)) {
            if (!tocados.has(codigo)) await map[codigo].destroy({ transaction: t });
        }

        await t.commit();
        res.json({ ok: true, msg: 'Kit actualizado correctamente' });

    } catch (err) {
        await t.rollback();
        console.error('postEditarKit error:', err);
        res.status(500).json({ error: 'Error interno al editar kit' });
    }
};


// Vista para editar un kit específico
exports.vistaEditarKitLista = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/EditarKitLista.html'));
};

//devuelve los kits para usarlos en las historias de usuario
exports.getKits = async (req, res) => {
    const kits = await Kit.findAll();
    res.json(kits);
};

exports.obtenerKitAsignado = async (req, res) => {
    try {
        const turnoId = req.params.turnoId;
        const usuarioId = req.session.usuario?.id;

        if (!usuarioId) {
            return res.status(401).json({ error: 'Usuario no autenticado' });
        }

        const rol = await Rol.findOne({
            where: { alumno_id: usuarioId },
            include: [{ model: Grupo, where: { turno_id: turnoId } }]
        });
        console.log('📌 Resultado de Rol.findOne:', rol);
        console.log('🧑 Alumno:', usuarioId, '| Turno:', turnoId);

        if (!rol) {
            return res.status(404).json({ error: 'Rol no encontrado para este alumno en el turno' });
        }

        const asignacion = await AsignacionKits.findOne({
            where: {
                grupo_id: rol.grupo_id,
                turno_id: turnoId
            }
        });

        if (!asignacion) {
            return res.json({ kitId: null });
        }

        return res.json({ kitId: asignacion.kit_id });
    } catch (err) {
        console.error('Error al obtener kit asignado:', err);
        return res.status(500).json({ error: 'Error interno al obtener el kit' });
    }
};