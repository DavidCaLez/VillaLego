(async function () {
  const turnoId = window.location.pathname.split("/").pop();
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
                Como <strong>Desarrollador</strong>, tu función es realizar las historias de usuario que te han sido asignadas.
            </p>
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
            </table>`;

          if (!kitId) {
            cont.innerHTML +=
              "<p>No hay kit asignado, así que no hay historias.</p>";
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
                    <td colspan="5" class="no-historias">
                        No tienes historias asignadas aún
                    </td>
                </tr>`;
          }
        } catch (err) {
          console.error("Error:", err);
          cont.innerHTML = `<p class="error">Error: ${err.message}</p>`;
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
        break;
      }
      case "product owner": {
        btnInstr.addEventListener("click", () => {
          mostrarInstrucciones("/pdfs/VillaLego_Guia_PO.pdf");
        });
        zonaSuperior.appendChild(btnInstr);
        cont.innerHTML = `
          <p>
            Como <strong>Product Owner</strong>, tu responsabilidad es validar los incrementos de la pila del sprint.

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
          cont.innerHTML +=
            "<p>No hay kit asignado, así que no hay historias.</p>";
          return;
        }

        const r3 = await fetch(`/backlog/api/historias/${grupoId}`);
        if (!r3.ok) {
          throw new Error("Error cargando historias");
        }

        const historias = await r3.json();
        const tbody = document.querySelector("#tabHistorias tbody");

        historias.forEach((h) => {
          const tr = document.createElement("tr");
          tr.innerHTML = `
                  <td>${h.id}</td>
                  <td>${h.titulo}</td>
                  <td>${h.descripcion}</td>
                  <td>${h.priority}</td>
                  <td>${h.size}</td>
                  <td>
                  <select class="validacion-select" data-historia-id="${h.id}">
                    <option value="false">Sin validar</option>
                    <option value=true>Validado</option>
                    <option value=false>No validado</option>
                  </select>
                  </td>`;

          tbody.append(tr);
        });
        document.querySelectorAll(".validacion-select").forEach((sel) => {
          sel.addEventListener("change", async () => {
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
        btnInstr.addEventListener("click", () => {
          mostrarInstrucciones("/pdfs/VillaLego_Guia_SM.pdf");
        });
        zonaSuperior.appendChild(btnInstr);

        cont.innerHTML = `
          <p>
            Como <strong>Scrum Master</strong>, tu rol es asegurar la realización de las reuniones y el seguimiento del proceso, ademas 
            de apuntar los puntos de historia restantes en cada reunion .
          `;

        break;
      }

      default:
        cont.textContent = `Rol desconocido: "${rol}"`;
    }
  } catch (err) {
    console.error(err);
    cont.textContent = "Error inesperado. Revisa la consola.";
  }

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
            case 'Revision del sprint':
                // Redirect to the sprint review page
                break;
            case 'Retrospectiva del sprint':
                // Redirect to the sprint retrospective page
                break;
            default:
                break;
        }

    } catch (error) {
        console.error('Error checking turn phase:', error);
    }
};
})();
