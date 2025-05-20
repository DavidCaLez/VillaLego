const path = require("path");
const Actividad = require("../Model/ActividadModel");
const Profesor = require("../Model/ProfesorModel");
const ActividadKit = require("../Model/ActividadKitModel");
const PackLego = require("../Model/PackLegoModel");
const Turno = require("../Model/TurnoModel");
const Usuario = require("../Model/UsuarioModel");
const Grupo = require("../Model/GrupoModel");
const AsignacionKits = require("../Model/AsignacionKitsModel");

exports.verActividad = (req, res) => {
  res.sendFile(
    path.join(__dirname, "../../Front/html/InformacionActividad.html")
  );
};

exports.vistaCrear = (req, res) => {
  res.sendFile(path.join(__dirname, "../../Front/html/Actividad.html"));
};

exports.getActividades = async (req, res) => {
  try {
    const profesorId = req.session.usuario?.id;
    if (!profesorId) return res.status(401).json({ error: 'No autenticado' });

    const actividades = await Actividad.findAll({
      where: { profesor_id: profesorId },
      include: Profesor
    });
    res.json(actividades);
  } catch (err) {
    console.error('Error al obtener actividades:', err);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
};


exports.crearActividad = async (req, res) => {
  try {
    const { nombre, tamaño_min, tamaño_max } = req.body;

    // Buscar al profesor correspondiente al usuario logueado

    const profesor = await Profesor.findOne({
      where: { usuario_id: req.session.usuario.id },
    });

    // Validación por si no se encuentra profesor
    if (!profesor) {
      return res.status(404).send("Profesor no encontrado para este usuario");
    }

    // Crear objeto de actividad
    const nuevaActividad = await Actividad.create({
      nombre,
      tamaño_min_Grupos: tamaño_min,
      tamaño_max_Grupos: tamaño_max,

      profesor_id: profesor.usuario_id,
    });

    // Guarda la Actividad en la sesion
    req.session.actividad = nuevaActividad;

    res.redirect(`/turno/turnos`); // Redirigir a la vista de turnos
  } catch (err) {
    console.error("Error al crear la actividad:", err);
    res.status(500).send("No se pudo crear la actividad");
  }
};

exports.obtenerActividad = async (req, res) => {
  const actividad = await Actividad.findByPk(req.params.id);

  if (!actividad) return res.status(404).send("Actividad no encontrada");

  // Obtener datos del profesor
  const profesor = await Usuario.findByPk(actividad.profesor_id, {
    attributes: ["nombre", "correo"],
  });

  res.json({
    nombre: actividad.nombre,
    tamaño_min: actividad.tamaño_min_Grupos,
    tamaño_max: actividad.tamaño_max_Grupos,
    profesorNombre: profesor?.nombre || "Desconocido",
    profesorCorreo: profesor?.correo || "No disponible"
  });
};

exports.editarActividad = async (req, res) => {
  const { nombre, fecha, tamaño_min, tamaño_max } = req.body;
  try {
    await Actividad.update(
      { nombre, fecha, tamaño_min_Grupos: tamaño_min, tamaño_max_Grupos: tamaño_max },
      { where: { id: req.params.id } }
    );
    res.status(200).json({ mensaje: "Actividad actualizada con éxito" });
  } catch (err) {
    console.error("Error al editar la actividad:", err);
    res.status(500).json({ error: "No se pudo actualizar la actividad" });
  }
};

exports.crearActividadCompleta = async (req, res) => {
  const { seleccion, actividadId } = req.body;
  if (!actividadId) {
    return res.status(400).json({ error: 'ID de la actividad es requerido' });
  }
  const sequelize = require('../config/Config_bd.env');
  const t = await sequelize.transaction();

  try {
    // 0. Recuperar la Actividad para usar tamaño_max_Grupos
    const actividad = await Actividad.findByPk(actividadId, { transaction: t });
    if (!actividad) throw new Error(`Actividad ${actividadId} no encontrada`);

    for (const { kitId, turnos } of seleccion) {
      const totalCantidad = turnos.reduce((sum, t) => sum + (t.cantidad || 0), 0);
      console.log(
        `– Kit ${kitId}: totalCantidad = ${totalCantidad}`
      );
      // 1. Cargar todos los packs de ese kit
      const packs = await PackLego.findAll({
        where: { kit_id: kitId },
        transaction: t
      });
      console.log(
        `  Packs encontrados:`,
        packs.map(p => ({ packId: p.id, cantidad_total: p.cantidad_total }))
      );
      if (!packs.length) {
        throw new Error(`Kit ${kitId} sin packs asociados`);
      }

      // 2. Validar usando stock agregado
      const stockTotal = packs.reduce((sum, p) => sum + p.cantidad_total, 0);
      console.log(`  StockTotal sumado = ${stockTotal}`);

      // 2b. Validar que *cada* turno no supere el stock disponible
      for (const { turnoId, cantidad } of turnos) {
        if (cantidad > stockTotal) {
          throw new Error(
            `Stock insuficiente para el kit ${kitId} en el turno ${turnoId}: ` +
            `solicitaste ${cantidad}, pero sólo hay ${stockTotal} disponibles`
          );
        }
      }

      // 3. Crear la cabecera de ActividadKit
      const actividadKit = await ActividadKit.create({
        actividad_id: actividadId,
        kit_id: kitId,
        cantidad_asignada: totalCantidad
      }, { transaction: t });

      // 4. Crear grupos y asignaciones por turno (igual que antes)
      for (const { turnoId, cantidad } of turnos) {
        for (let i = 0; i < cantidad; i++) {
          const grupo = await Grupo.create({
            tamanio: actividad.tamaño_max_Grupos,
            turno_id: turnoId
          }, { transaction: t });

          await AsignacionKits.create({
            grupo_id: grupo.id,
            turno_id: turnoId,
            kit_id: kitId
          }, { transaction: t });
        }
      }

      // 5. Descontar del stock total repartido entre packs, de momento no se puede borrar hasta que no preguntemos al profe si 
      // asi esta bien

      
      /*let remaining = totalCantidad;
      for (const pack of packs) {
        if (remaining <= 0) break;
        // descuenta hasta lo que quede en este pack o lo que falte por descontar
        const toDeduct = Math.min(pack.cantidad_total, remaining);
        pack.cantidad_total -= toDeduct;
        remaining -= toDeduct;
        await pack.save({ transaction: t });
      }
      // al final remaining debe ser 0
      */
    }

    await t.commit();
    res.status(200).json({
      mensaje: "Kits asignados correctamente",
      redirectTo: "/profesor/dashboard"
    });

  } catch (err) {
    await t.rollback();
    console.error("Error en crearActividadCompleta:", err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.vistaEditar = (req, res) => {
  // Se envía el archivo editarActividad.html ubicado en Front/html
  res.sendFile(path.join(__dirname, "../../Front/html/EditarActividad.html"));
};
exports.obtenerLinkActividad = async (req, res) => {
  try {
    const actividad = await Actividad.findByPk(req.params.id);
    if (!actividad) {
      return res.status(404).json({ error: "Actividad no encontrada" });
    }
    res.json({ link: `http://localhost:3000/alumno/dashboard/${actividad.id}/${actividad.token}` });
  } catch (err) {
    console.error("Error al obtener el link de la actividad:", err);
    res.status(500).json({ error: "Error al obtener el link de la actividad"});
  }
}
