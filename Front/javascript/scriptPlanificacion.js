const turnoId = window.location.pathname.split("/").pop();

(async function () {
  const cont = document.getElementById("contenido");

  // -----------------------------
  // 1) Header dinámico: fase y rol
  // -----------------------------
  try {
    // Obtener rol/otros datos para construir el header
    const resRol = await fetch(`/alumno/api/rolTurno/${turnoId}`);
    const { rol } = await resRol.json();

    // Crear encabezado dinámico
    const header = document.createElement("div");
    header.id = "header-fase-rol";
    header.style.backgroundColor = "#f0f0f0";
    header.style.padding = "10px";
    header.style.marginBottom = "1rem";
    header.style.borderBottom = "2px solid #ccc";
    header.style.fontWeight = "bold";
    // Nota: en este archivo sabemos que la fase es "Planificación del sprint"
    header.innerHTML = `Se encuentra en la <strong>Fase</strong>: Planificación del sprint, su <strong>Rol</strong> es: ${rol}`;
    // Insertar el header justo antes del contenido principal
    cont.parentNode.insertBefore(header, cont);
  } catch (errHeader) {
    console.error("Error al obtener el rol para el header:", errHeader);
    // Si falla, seguimos adelante sin header
  }

  // -----------------------------
  // 2) Zona superior (botón Instrucciones e iframe)
  // -----------------------------
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

  // -----------------------------
  // 3) Resto del script original
  // -----------------------------
  try {
    const resp = await fetch(`/alumno/api/rolTurno/${turnoId}`);
    if (!resp.ok) {
      const error = await resp.text();
      cont.textContent = `Error: ${error}`;
      return;
    }

    const { rol: rolObtenido, grupoId, kitId } = await resp.json();
    const rolNorm = rolObtenido.trim().toLowerCase();
    console.log("🔍 Rol recibido:", rolObtenido);

    // Crear botón instrucciones
    const btnInstr = document.createElement("button");
    btnInstr.textContent = "📘 Ver Instrucciones";

    switch (rolNorm) {
      case "desarrollador": {
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
        cont.innerHTML += `
          <p>
            Como <strong>Desarrollador</strong>, tu responsabilidad es planificar el sprint usando la técnica
            <strong>Planning Poker</strong> para el tamaño, y <strong>elegir</strong> las historias de usuario a realizar. También 
            debes ayudar a definir el <strong>objetivo del sprint</strong> junto al Scrum Master.
          </p>
          </p>
          <table id="tabHistorias">
            <thead><tr><th>ID</th><th>Título</th><th>Descripción</th><th>Prioridad</th></tr></thead>
            <tbody></tbody>
          </table>`;

        if (!kitId) {
          cont.innerHTML +=
            "<p>No hay kit asignado, así que no hay historias.</p>";
          return;
        }

        const r3 = await fetch(`/backlog/api/historias/${grupoId}`);
        if (!r3.ok) {
          cont.innerHTML += "<p>Error cargando historias.</p>";
          return;
        }

        const historias = await r3.json();
        const tbody = document.querySelector("#tabHistorias tbody");
        historias.forEach((h) => {
          const tr = document.createElement("tr");
          if (h.priority !== null) {
            tr.innerHTML = `
            <td>${h.id}</td>
            <td>${h.titulo}</td>
            <td>${h.descripcion}</td>
            <td>${h.priority}</td>
            `;
            tbody.append(tr);
          }
        });
        break;
      }
      case "product owner": {
        btnInstr.addEventListener("click", () => {
          mostrarInstrucciones("/pdfs/VillaLego_Guia_PO.pdf");
        });
        zonaSuperior.appendChild(btnInstr);
        cont.innerHTML = `
          <p>
            Como <strong>Product Owner</strong>, tu responsabilidad es planificar el sprint usando la técnica
            <strong>Planning Poker</strong> para el tamaño, y <strong>elegir</strong> las historias de usuario a realizar. También 
            debes ayudar a definir el <strong>objetivo del sprint</strong>.
          </p>
          <form id="formObjetivo">
            <label for="objetivo">Objetivo del Sprint:</label>
            <textarea id="objetivo" name="objetivo" rows="4" cols="50" required></textarea>
            <button type="submit">Guardar Objetivo</button>
        </form>`;

        document.getElementById('formObjetivo').addEventListener('submit', async (e) => {
          e.preventDefault();
          const objetivo = document.getElementById('objetivo').value.trim();

          if (!objetivo) {
            mostrarMensaje('El objetivo no puede estar vacío', 'error');
            return;
          }

          try {
            const res = await fetch(`/sprint/api/sprint/${grupoId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ objetivo })
            });

            const data = await res.json();

            if (!res.ok) {
              throw new Error(data.error || 'Error al guardar el objetivo');
            }

            mostrarMensaje(data.mensaje, 'success');
            document.getElementById('objetivo').value = '';

          } catch (err) {
            console.error('Error:', err);
            mostrarMensaje(err.message, 'error');
          }
        });

        function mostrarMensaje(mensaje, tipo) {
          const mensajeDiv = document.createElement('div');
          mensajeDiv.className = `message ${tipo}-message`;
          mensajeDiv.textContent = mensaje;
          cont.insertBefore(mensajeDiv, cont.firstChild);
          setTimeout(() => mensajeDiv.remove(), 3000);
        }
        break;
      }

      case "scrum master": {
        btnInstr.addEventListener("click", () => {
          mostrarInstrucciones("/pdfs/VillaLego_Guia_SM.pdf");
        });
        zonaSuperior.appendChild(btnInstr);

        cont.innerHTML = `
          <p>
            Como <strong>Scrum Master</strong>, tu rol es ayudar a tu equipo a planificar el sprint indicando el tamaño de las 
            historias de usuario más prioritarias y facilitando la técnica de <strong>Planning Poker</strong>, además de asignar los 
            desarrolladores a las historias de usuario a realizar.
          </p>
           <table id="tabHistorias">
            <thead><tr><th>ID</th><th>Título</th><th>Descripción</th><th>Prioridad</th><th>SP</th><th>Asignación</th></tr></thead>
            <tbody></tbody>
          </table>
          `;
        if (!kitId) {
          cont.innerHTML +=
            "<p>No hay kit asignado, así que no hay historias.</p>";
          return;
        }
        const r3 = await fetch(`/backlog/api/historias/${grupoId}`);
        if (!r3.ok) {
          cont.innerHTML += "<p>Error cargando historias.</p>";
          return;
        }

        const historias = await r3.json();
        const tbody = document.querySelector("#tabHistorias tbody");
        historias.forEach((h) => {
          if (h.priority !== null) {
            const tr = document.createElement("tr");
            tr.innerHTML = `
      <td>${h.id}</td>
      <td>${h.titulo}</td>
      <td>${h.descripcion}</td>
      <td>${h.priority}</td>
      <td>
        <select id="size" data-id="${h.id}">
          <option value="">– elige –</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="5">5</option>
          <option value="8">8</option>
          <option value="13">13</option>
          <option value="?">?</option>
          <option value="∞">∞</option>
        </select>
      </td>
      <td>
        <select id="asignar" data-id="${h.id}">
          <option value="">– elige –</option>
        </select>
      </td>`;

            const selectAsignar = tr.querySelector('select#asignar');
            const selectSize = tr.querySelector('select#size');

            // Rellenar el select con desarrolladores
            fetch(`/rol/api/desarrolladores/${grupoId}`)
              .then((res) => res.json())
              .then((desarrolladores) => {
                desarrolladores.forEach((dev) => {
                  const option = document.createElement("option");
                  option.value = dev.id;
                  option.textContent = dev.nombre;
                  selectAsignar.append(option);
                });
              })
              .catch((err) => {
                console.error("Error cargando desarrolladores:", err);
              });

            // Añadir listeners
            const historiaId = h.id;

            const actualizarBacklog = async () => {
              const size = selectSize.value;
              const alumnoId = selectAsignar.value;

              if (size && alumnoId) {
                try {
                  const res = await fetch('/backlog/api/actualizarBacklog', {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      historiaId,
                      size,
                      alumnoId
                    })
                  });

                  const data = await res.json();
                  if (!res.ok) throw new Error(data.error || "Error en la actualización");

                  console.log(`✔️ Historia ${historiaId} actualizada`);
                } catch (err) {
                  console.error(`❌ Error actualizando historia ${historiaId}:`, err);
                }
              }
            };

            selectSize.addEventListener('change', actualizarBacklog);
            selectAsignar.addEventListener('change', actualizarBacklog);

            tbody.append(tr);
          }
        });

        break;
      }

      default:
        cont.textContent = `Rol desconocido: "${rolObtenido}"`;
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
        case 'Ejecucion del sprint':
            window.location.href = `/turno/sprint/${turnoId}`;
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
    console.error('Error parseando SSE en Planificación:', e);
  }
};

evtSource.onerror = (err) => {
  console.error('Error en conexión SSE (Planificación):', err);
};