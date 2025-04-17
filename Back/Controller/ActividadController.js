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
  const actividades = await Actividad.findAll();
  res.json(actividades);
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
    const nuevaActividad = {
      nombre,
      tamaño_min_Grupos: tamaño_min,
      tamaño_max_Grupos: tamaño_max,

      profesor_id: profesor.usuario_id,
    };

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
    ...actividad.toJSON(),
    profesorNombre: profesor?.nombre || "Desconocido",
    profesorCorreo: profesor?.correo || "No disponible",
  });
};

exports.editarActividad = async (req, res) => {
  const { nombre, fecha, tamaño_min, tamaño_max } = req.body;
  try {
    await Actividad.update(
      { nombre, fecha, tamaño_min, tamaño_max },
      { where: { id: req.params.id } }
    );
    res.status(200).json({ mensaje: "Actividad actualizada con éxito" });
  } catch (err) {
    console.error("Error al editar la actividad:", err);
    res.status(500).json({ error: "No se pudo actualizar la actividad" });
  }
};

exports.crearActividadCompleta = async (req, res) => {
  let { seleccion } = req.body;

  // Validación inicial: seleccion debe ser un array

  if (!Array.isArray(seleccion)) {
    console.error("⚠️ Error: La selección recibida no es un array:", seleccion);
    return res
      .status(400)
      .json({ error: "Formato inválido: la selección debe ser un array" });
  }
  // Inicia una transacción

  const sequelize = require("../config/Config_bd.env");
  const t = await sequelize.transaction();
  try {
    const totalKits =
      req.body.seleccion?.reduce((sum, item) => sum + item.cantidad, 0) || 0;
    req.session.actividad.max_grupos = totalKits;
    const nAct = await Actividad.create(req.session.actividad, {
      transaction: t,
    });
    // Get the total number of kits from the request body

    // Recorre cada kit seleccionado
    const turnosConActividad = req.session.turnos.map((turno) => ({
      ...turno,
      actividad_id: nAct.id,
    }));
    await Turno.bulkCreate(turnosConActividad, { transaction: t });
    for (const { kitId, cantidad } of seleccion) {
      const packs = await PackLego.findAll({
        where: { kit_id: kitId },
        transaction: t,
      });

      if (!packs.length) {
        throw new Error(`No hay packs asociados al kit ${kitId}`);
      }

      const stockSuficiente = packs.every(
        (pack) => pack.cantidad_total >= cantidad
      );
      if (!stockSuficiente) {
        throw new Error(`Stock insuficiente para el kit ${kitId}`);
      }

      for (i = 0; i < cantidad; i++) {
        for (const turno of turnosConActividad) {
            const ActividadKitCreada = await ActividadKit.create(
                {
                  actividad_id: nAct.id,
                  kit_id: kitId,
                },
                { transaction: t }
              );
          await Grupo.create(
            {
              tamanio: nAct.tamaño_max_Grupos,
              turno_id: turno.id,
            },
            { transaction: t }
          );
          await AsignacionKits.create(
            {
              id_Grupo: turno.id,
              id_ActividadKit: ActividadKitCreada.id,
            },
            { transaction: t }
          );
        }
      }

      // Actualizar stock de cada pack del kit
      for (const pack of packs) {
        pack.cantidad_total -= cantidad;
        await pack.save({ transaction: t });
      }
    }

    // Si todo va bien, guardar cambios
    await t.commit();
    console.log(`✅ Kits asignados correctamente a la actividad ${nAct.id}`);
    res
      .status(200)
      .json({
        mensaje: "Kits asignados correctamente",
        redirectTo: "/profesor/dashboard",
      });
  } catch (err) {
    // Si hay error, deshacer todo
    await t.rollback();

    console.error(
      `🛑 ROLLBACK EJECUTADO: no se asignó ningún kit a la actividad ${actividadId}`
    );
    console.error("🔍 Motivo:", err.message);

    if (!res.headersSent) {
      res.status(400).json({ error: err.message });
    }
  }
};

exports.vistaEditar = (req, res) => {
  // Se envía el archivo editarActividad.html ubicado en Front/html
  res.sendFile(path.join(__dirname, "../../Front/html/EditarActividad.html"));
};
