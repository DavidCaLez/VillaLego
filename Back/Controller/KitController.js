const path = require('path');
const Kit = require('../Model/KitModel');
const PackLego = require('../Model/PackLegoModel');
const ActividadKit = require('../Model/ActividadKitModel');
const sequelize = require('../config/Config_bd.env');


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
exports.obtenerKitsDeActividad = async (req, res) => {
    const actividadId = req.params.actividadId;

    try {
        const relaciones = await ActividadKit.findAll({ where: { actividad_id: actividadId } });

        const kitsConInfo = await Promise.all(relaciones.map(async rel => {
            const kit = await Kit.findByPk(rel.kit_id, {
                include: [{ model: PackLego, as: 'packs' }]
            });

            return {
                id: kit.id,
                nombre: kit.nombre,
                descripcion: kit.descripcion,
                cantidad_asignada: rel.cantidad_asignada,
                packs: kit.packs.map(p => ({
                    nombre: p.nombre,
                    descripcion: p.descripcion,
                    cantidad_total: p.cantidad_total
                }))
            };
        }));

        res.json(kitsConInfo);
    } catch (error) {
        console.error("Error al obtener los kits asignados:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Función para enviar la vista de edición de kits
exports.vistaEditarKits = (req, res) => {
    res.sendFile(path.join(__dirname, '../../Front/html/EditarKit.html'));
};

// Función para procesar la edición de kits (incluye actualización en tabla PackLego)
exports.editarKits = async (req, res) => {
    let t;
    try {
        const actividadId = req.params.actividadId;
        const { kits } = req.body; // Se espera que kits sea un array de objetos: [{ kit_id, cantidad_asignada }, ...]

        if (!actividadId || !Array.isArray(kits)) {
            return res.status(400).json({ error: "Datos inválidos" });
        }

        t = await sequelize.transaction();

        // 1. Obtener las asignaciones existentes para esta actividad
        const asignacionesExistentes = await ActividadKit.findAll({
            where: { actividad_id: actividadId },
            transaction: t
        });
        // Crear un mapa para acceder fácilmente a la cantidad asignada por kit_id
        const existingMap = {};
        asignacionesExistentes.forEach(assignment => {
            existingMap[assignment.kit_id] = assignment.cantidad_asignada;
        });

        const updatedIds = [];

        // Dentro de la función editarKits en KitController.js:
        for (const kitData of kits) {
            if (kitData.cantidad_asignada < 0) {
                throw new Error(`Cantidad asignada para el kit ${kitData.kit_id} no puede ser negativa.`);
            }
            // Continúa con la lógica de actualización/inserción
        }

        // 2. Procesar cada asignación enviada (nueva o actualización)
        for (const kitData of kits) {
            const kitId = kitData.kit_id;
            const newCantidad = kitData.cantidad_asignada;
            // Determinar la cantidad vieja, si existe, o 0 si es nuevo
            const oldCantidad = existingMap[kitId] || 0;
            // Calcular la diferencia: diff > 0 significa que se aumenta la asignación y se debe restar esa diferencia al stock;
            // diff < 0 significa que se reduce la asignación y se debe sumar la diferencia (valor negativo) al stock.
            const diff = newCantidad - oldCantidad;

            if (existingMap.hasOwnProperty(kitId)) {
                // Actualizar el registro existente en ActividadKit
                await ActividadKit.update(
                    { cantidad_asignada: newCantidad },
                    { where: { actividad_id: actividadId, kit_id: kitId }, transaction: t }
                );
            } else {
                // Crear nuevo registro en ActividadKit
                await ActividadKit.create(
                    { actividad_id: actividadId, kit_id: kitId, cantidad_asignada: newCantidad },
                    { transaction: t }
                );
            }

            // Actualizar el stock en la tabla PackLego para este kit
            const packs = await PackLego.findAll({ where: { kit_id: kitId }, transaction: t });
            if (!packs.length) {
                throw new Error(`No hay packs asociados al kit ${kitId}`);
            }
            for (const pack of packs) {
                // Antes de actualizar, comprobar que el nuevo stock no sea negativo
                if (pack.cantidad_total - diff < 0) {
                    throw new Error(`Stock insuficiente para el kit ${kitId} en el pack ${pack.nombre}`);
                }
                pack.cantidad_total -= diff;
                await pack.save({ transaction: t });
            }

            updatedIds.push(kitId);
        }

        // 3. Procesar asignaciones eliminadas: aquellas que existían antes pero ya no se envían
        const deletedIds = Object.keys(existingMap)
            .map(idStr => parseInt(idStr))
            .filter(kitId => !updatedIds.includes(kitId));

        for (const kitId of deletedIds) {
            const oldCantidad = existingMap[kitId];
            // Para cada pack asociado a este kit, devolver el stock previamente asignado
            const packs = await PackLego.findAll({ where: { kit_id: kitId }, transaction: t });
            for (const pack of packs) {
                pack.cantidad_total += oldCantidad;
                await pack.save({ transaction: t });
            }
            // Eliminar la asignación de ActividadKit
            await ActividadKit.destroy({
                where: { actividad_id: actividadId, kit_id: kitId },
                transaction: t
            });
        }

        await t.commit();
        res.status(200).json({
            mensaje: "Kits actualizados correctamente",
            redirectTo: "/profesor/dashboard"
        });
    } catch (err) {
        if (t) await t.rollback();
        console.error("Error al editar kits:", err);
        res.status(500).json({ error: "Error interno al actualizar kits" });
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