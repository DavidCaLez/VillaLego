  const turnoId = window.location.pathname.split("/").pop();
(async function () {
  const cont = document.getElementById("contenido");
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
            <strong>Plannig Poker</strong> para el tamaño, y <strong>elegir</strong> las historias de usuario a realizar.
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
          if (h.priority !== null){
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
            <strong>Planning Poker</strong> para el tamaño, y <strong>elegir</strong> las historias de usuario a realizar.
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
            historias de usuario mas prioritarias y facilitando la técnica de <strong>Planning Poker</strong>, ademas de asignar los 
            desarrolladores a las historias de usuario a realizar.
          </p>
           <table id="tabHistorias">
            <thead><tr><th>ID</th><th>Título</th><th>Descripción</th><th>Prioridad</th></tr></thead>
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
            <td>${h.prioridad}</td>
            <td>
              <select id = "size" data-id="${h.id}">
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
          tbody.append(tr);
          }
          // Escuchar cambios en los select de tamaño y desarrollador
          const selectSize = tr.querySelector('select#size');
          const selectAsignar2 = tr.querySelector('select#asignar');

          const historiaId = h.id;

          const actualizarBacklog = async () => {
            const size = selectSize.value;
            const alumnoId = selectAsignar2.value;

            // Solo actualizar si ambos están definidos
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
          selectAsignar2.addEventListener('change', actualizarBacklog);

        });

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
  const intervalId = setInterval(continuar, 2000);
async function continuar() {
    try {
        const response = await fetch(`/turno/fase/${turnoId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Current phase:', data.fase);
        switch (data.fase) {
            case 'Ejecucion del sprint':
                // Redirect to the sprint execution page
                window.location.href = '/turno/sprint/' + turnoId;
                break;
            case 'Revision del sprint':
                window.location.href = '/turno/revision/' + turnoId;
                // Redirect to the sprint review page
                break;
            case 'Retrospectiva del sprint':
                // Redirect to the sprint retrospective page
                window.location.href = `/turno/retrospectiva/vista/${turnoId}`;
                break;
            default:
                break;
        }

    } catch (error) {
        console.error('Error checking turn phase:', error);
    }
}
window.addEventListener('unload', () => {
    clearInterval(intervalId);
});