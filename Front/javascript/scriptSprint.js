// Front/javascript/scriptSprint.js

const turnoId = window.location.pathname.split("/").pop();

(async function () {
  const cont = document.getElementById("contenido");

  // -----------------------------
  // Header dinámico: fase y rol
  // -----------------------------
  try {
    const resRol = await fetch(`/alumno/api/rolTurno/${turnoId}`);
    const { rol } = await resRol.json();

    const header = document.createElement("div");
    header.id = "header-fase-rol";
    header.style.backgroundColor = "#f0f0f0";
    header.style.padding = "10px";
    header.style.marginBottom = "1rem";
    header.style.borderBottom = "2px solid #ccc";
    header.style.fontWeight = "bold";
    // Aquí la fase es "Desarrollo"
    header.innerHTML = `Se encuentra en la <strong>Fase</strong>: Desarrollo, su <strong>Rol</strong> es: ${rol}`;
    cont.parentNode.insertBefore(header, cont);
  } catch (errHeader) {
    console.error("Error al obtener el rol para el header:", errHeader);
  }

  // Contenedor fijo para botones e instrucciones
  const zonaSuperior = document.createElement("div");
  zonaSuperior.id = "zona-superior";
  cont.parentNode.insertBefore(zonaSuperior, cont);

  const iframe = document.createElement("iframe");
  iframe.id = "instruccionesFrame";
  iframe.style.width = "100%";
  iframe.style.height = "70vh";
  iframe.style.display = "none";
  iframe.style.border = "1px solid #ccc";
  zonaSuperior.appendChild(iframe);

  let visible = false;

  const mostrarInstrucciones = (ruta) => {
    if (iframe.src.includes(ruta) && visible) {
      iframe.style.display = "none";
      visible = false;
    } else {
      iframe.src = ruta;
      iframe.style.display = "block";
      visible = true;
    }
  };

  // Ocultar instrucciones si se hace clic fuera del iframe
  document.addEventListener("click", (e) => {
    const isClickInside = zonaSuperior.contains(e.target);
    if (!isClickInside && visible) {
      iframe.style.display = "none";
      visible = false;
    }
  });

  try {
    const resp = await fetch(`/alumno/api/rolTurno/${turnoId}`);
    if (!resp.ok) {
      const error = await resp.text();
      cont.textContent = `Error: ${error}`;
      return;
    }

    const { rol, grupoId, kitId } = await resp.json();
    const rolNorm = rol.trim().toLowerCase();
    console.log("🔍 Rol recibido:", rol);

    // Crear botón instrucciones
    const btnInstr = document.createElement("button");
    btnInstr.textContent = "📘 Ver Instrucciones";

    switch (rolNorm) {
      case "desarrollador": {
        // ───────────────────────── DESARROLLADOR ─────────────────────────
        try {
          btnInstr.addEventListener("click", () => {
            mostrarInstrucciones("/pdfs/VillaLego_Guia_Desarrolladores.pdf");
          });
          zonaSuperior.appendChild(btnInstr);
          cont.innerHTML = '<h2>Manual del Kit</h2><ul id="manuales"></ul>';
          if (!kitId) {
            cont.innerHTML += "<p>No hay kit asignado aún.</p>";
            return;
          }
          const r2 = await fetch(`/packs/api/manuales/${kitId}`);
          if (!r2.ok) {
            cont.innerHTML += "<p>Error cargando manuales.</p>";
            return;
          }
          const manuals = await r2.json();
          manuals.forEach((m) => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="${m.url}" target="_blank">${m.nombre}</a>`;
            document.getElementById("manuales").append(li);
          });
          // Obtener alumnoId primero
          const alumnoResp = await fetch("/alumno/api/alumnoId");
          if (!alumnoResp.ok) {
            throw new Error("Error obteniendo ID de alumno");
          }
          const { alumnoId } = await alumnoResp.json();

          cont.innerHTML += `
            <p>
              Como <strong>Desarrollador</strong>, tu función es realizar las historias de usuario que te han sido asignadas 
              siguiendo las instrucciones que se encuentran en los manuales.
            </p>
            <div class="table-responsive">
              <table id="tabHistorias">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Descripción</th>
                    <th>Prioridad</th>
                    <th>SP</th>
                    <th>Imagen</th>
                  </tr>
                </thead>
                <tbody></tbody>
              </table>
            </div>`;


          if (!kitId) {
            cont.innerHTML += "<p>No hay kit asignado, así que no hay historias.</p>";
            return;
          }

          const r3 = await fetch(`/backlog/api/historias/${grupoId}`);
          if (!r3.ok) {
            throw new Error("Error cargando historias");
          }

          const historias = await r3.json();
          const tbody = document.querySelector("#tabHistorias tbody");

          historias.forEach((h) => {
            if (h.alumno_id === alumnoId) {
              const tr = document.createElement("tr");
              tr.innerHTML = `
                <td>${h.id}</td>
                <td>${h.titulo}</td>
                <td>${h.descripcion}</td>
                <td>${h.priority}</td>
                <td>${h.size}</td>
                <td>
                  <input type="file" data-backlog-id="${h.id}" class="input-img" />
                  <button class="btn-subir" data-backlog-id="${h.id}">Subir</button>
                </td>`;
              tbody.append(tr);
            }
          });

          if (!tbody.hasChildNodes()) {
            tbody.innerHTML = `
              <tr>
                <td colspan="6" class="no-historias">
                  No tienes historias asignadas aún
                </td>
              </tr>`;
          }
          document.querySelectorAll(".btn-subir").forEach((btn) => {
            btn.addEventListener("click", async () => {
              const id = btn.dataset.backlogId;
              const input = document.querySelector(
                `input[data-backlog-id="${id}"]`
              );
              const file = input.files[0];
              if (!file) return alert("Selecciona una imagen");

              const formData = new FormData();
              formData.append("imagen", file);
              formData.append("backlogId", id);

              const resp = await fetch("/resultado/subir", {
                method: "POST",
                body: formData,
              });

              const json = await resp.json();
              if (resp.ok) {
                alert("✅ Imagen subida");
              } else {
                alert("❌ Error: " + json.error);
              }
            });
          });
        } catch (err) {
          console.error("Error:", err);
          cont.innerHTML = `<p class="error">Error: ${err.message}</p>`;
        }
        break;
      }

      case "product owner": {
        // ───────────────────────── PRODUCT OWNER ─────────────────────────
        btnInstr.addEventListener("click", () => {
          mostrarInstrucciones("/pdfs/VillaLego_Guia_PO.pdf");
        });
        zonaSuperior.appendChild(btnInstr);

        cont.innerHTML = `
          <p>
            Como <strong>Product Owner</strong>, tu responsabilidad es validar los incrementos de la pila del sprint.
            Solo podrás validar una historia si el Desarrollador ya subió la imagen correspondiente.
          </p>
          <table id="tabHistorias">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Prioridad</th>
                <th>SP</th>
                <th>Validado</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>`;

        if (!kitId) {
          cont.innerHTML += "<p>No hay kit asignado, así que no hay historias.</p>";
          return;
        }

        const r3 = await fetch(`/backlog/api/historias/${grupoId}`);
        if (!r3.ok) {
          throw new Error("Error cargando historias");
        }

        const historias = await r3.json();
        const tbody = document.querySelector("#tabHistorias tbody");

        // Para cada historia, comprobamos si existe imagen en /resultado/:h.id
        for (const h of historias) {
          let imageUrl = "";
          try {
            const resImg = await fetch(`/resultado/${h.id}`); // ← CAMBIO: comprobamos imagen
            if (resImg.ok) {
              const dataImg = await resImg.json();
              imageUrl = dataImg.imagen; // ruta de la imagen subida por el desarrollador
            }
          } catch (errImg) {
            console.warn("No se pudo cargar imagen de backlogId=", h.id, errImg);
          }

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${h.id}</td>
            <td>${h.titulo}</td>
            <td>${h.descripcion}</td>
            <td>${h.priority}</td>
            <td>${h.size}</td>
            <td>
              <select class="validacion-select" data-historia-id="${h.id}" 
                ${imageUrl ? "" : "disabled"}> 
                <!-- ← CAMBIO: deshabilitado si NO hay imagen -->
                <option value="false">Sin validar</option>
                <option value="true">Validado</option>
                <option value="false">No validado</option>
              </select>
            </td>`;
          tbody.append(tr);
        }

        // Si el PO intenta cambiar un <select> deshabilitado, mostramos alerta
        document.querySelectorAll(".validacion-select").forEach((sel) => {
          sel.addEventListener("change", async () => {
            if (sel.disabled) {
              alert(
                "Debes esperar a que el Desarrollador suba una imagen antes de validar."
              );
              sel.value = "false"; // asegurarnos de que no cambie
              return;
            }
            const historiaId = sel.dataset.historiaId;
            const valor = sel.value === "true";

            const resp = await fetch("/backlog/validar", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ historiaId, validadoPO: valor }),
            });

            const json = await resp.json();
            if (resp.ok) {
              alert("✅ Historia actualizada correctamente");
            } else {
              alert("❌ Error: " + json.error);
            }
          });
        });
        break;
      }

      case "scrum master": {
        // ───────────────────────── SCRUM MASTER ─────────────────────────
        btnInstr.addEventListener("click", () => {
          mostrarInstrucciones("/pdfs/VillaLego_Guia_SM.pdf");
        });
        zonaSuperior.appendChild(btnInstr);
        cont.innerHTML = `
          <p>
            Como <strong>Scrum Master</strong>, tu rol es asegurar la realización de las reuniones y el seguimiento del proceso, 
            además de apuntar los puntos de historia restantes en cada reunión.
          </p>`;
        break;
      }

      default:
        cont.textContent = `Rol desconocido: "${rol}"`;
    }
  } catch (err) {
    console.error(err);
    cont.textContent = "Error inesperado. Revisa la consola.";
  }
})();

function toggleMenu() {
  const menu = document.getElementById("menu-desplegable");
  if (menu) menu.classList.toggle("show");
}

fetch("/inicial")
  .then((res) => res.json())
  .then((data) => {
    document.querySelector(".avatar").textContent = data.inicial.toUpperCase();
  });

// Opción “Darse de baja”
document.getElementById("darseDeBaja").addEventListener("click", async (e) => {
  e.preventDefault();
  if (
    !confirm(
      "¿Estás seguro de que quieres darte de baja? Se eliminará tu cuenta y todas tus actividades."
    )
  ) {
    return;
  }
  try {
    const res = await fetch("/baja", {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      throw new Error(`Status ${res.status}: ${txt}`);
    }
    const { redirectTo } = await res.json();
    window.location.href = redirectTo;
  } catch (err) {
    console.error("Baja fallida:", err);
    alert("No se pudo completar la baja. Intenta de nuevo más tarde.");
  }
});

const evtSource = new EventSource(`/turno/api/events/${turnoId}`);
evtSource.onmessage = (event) => {
  try {
    const { fase } = JSON.parse(event.data);
    switch (fase) {
      case 'Lectura instrucciones':
        window.location.href = `/turno/instrucciones/${turnoId}`;
        break;
      case 'Priorizacion de la pila del producto':
        window.location.href = `/turno/priorizacion/${turnoId}`;
        break;
      case 'Planificacion del sprint':
        window.location.href = `/turno/planificacion/${turnoId}`;
        break;
      case 'Revision del sprint':
        window.location.href = `/turno/revision/${turnoId}`;
        break;
      case 'Retrospectiva del sprint':
        window.location.href = `/turno/retrospectiva/vista/${turnoId}`;
        break;
      case 'Terminado':
        window.location.href = `/alumno/dashboard/principal`;
        break;
      default:
        console.warn('Fase sin ruta asignada:', fase);
    }
  } catch (e) {
    console.error('Error parseando SSE en Sprint:', e);
  }
};

evtSource.onerror = (err) => {
  console.error('Error en conexión SSE (Sprint):', err);
};


// Generar QR para compartir la URL del sprint
document.addEventListener("DOMContentLoaded", async () => {
  // 1) Pedimos al servidor la IP de LAN
  let host, port;
  try {
    const resp = await fetch('/api/local-ip');
    const json = await resp.json();
    host = json.ip;
    port = json.port;
  } catch (err) {
    console.error('No pude obtener la IP local:', err);
    // Fallback a hostname/puerto actuales
    host = window.location.hostname;
    port = window.location.port;
  }

  // 2) Construimos la URL que debe usar el móvil
  const path = window.location.pathname;   // p.ej. /turno/sprint/1
  const url = `http://${host}:${port}${path}`;

  // 3) Generamos el QR en el contenedor
  const qrContainer = document.getElementById("qr-image");
  if (!qrContainer) {
    console.error("No existe #qr-image en el DOM");
    return;
  }
  qrContainer.innerHTML = "";
  new QRCode(qrContainer, {
    text: url,
    width: 200,
    height: 200,
    correctLevel: QRCode.CorrectLevel.H
  });
});