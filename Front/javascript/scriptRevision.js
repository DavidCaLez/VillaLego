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
    // Aquí la fase es "Revisión del sprint"
    header.textContent = `Se encuentra en la <strong>Fase</strong>: Revisión del sprint, su <strong>Rol</strong> es: ${rol}`;

    // Insertar el header antes del contenido principal
    cont.parentNode.insertBefore(header, cont);
  } catch (errHeader) {
    console.error("Error al obtener el rol para el header:", errHeader);
  }

  // -----------------------------
  // Zona superior para iframe e instrucciones
  // -----------------------------
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

  document.addEventListener("click", (e) => {
    const isClickInside = zonaSuperior.contains(e.target);
    if (!isClickInside && visible) {
      iframe.style.display = "none";
      visible = false;
    }
  });

  // -----------------------------
  // Lógica principal según rol
  // -----------------------------
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

    const btnInstr = document.createElement("button");
    btnInstr.textContent = "📘 Ver Instrucciones";

    switch (rolNorm) {
      case "desarrollador": {
        btnInstr.addEventListener("click", () => {
          mostrarInstrucciones("/pdfs/VillaLego_Guia_Desarrolladores.pdf");
        });
        zonaSuperior.appendChild(btnInstr);

        cont.innerHTML += `
          <p>
            Como <strong>Desarrollador</strong>, tu responsabilidad es ayudar al resto del equipo a presentar el resultado al cliente y 
            ayudar a realizar el burndown chart.
          </p>
        `;
        break;
      }

      case "product owner": {
        btnInstr.addEventListener("click", () => {
          mostrarInstrucciones("/pdfs/VillaLego_Guia_PO.pdf");
        });
        zonaSuperior.appendChild(btnInstr);

        cont.innerHTML = `
          <p>
            Como <strong>Product Owner</strong>, tu única responsabilidad en esta fase es validar junto al cliente si las historias de usuario fueron aceptadas.
          </p>
          <table id="tabHistorias">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Aceptación Cliente</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        `;

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
              <td>
                <select class="select-validacion-cliente" data-id="${h.id}">
                  <option value="">– elige –</option>
                  <option value="false">No aceptado</option>
                  <option value="true">Aceptado</option>
                </select>
              </td>
            `;
            tbody.appendChild(tr);
          }
        });

        document.addEventListener("change", async (e) => {
          if (e.target.classList.contains("select-validacion-cliente")) {
            const historiaId = e.target.dataset.id;
            const validado = e.target.value === "true";
            try {
              const resp = await fetch("/backlog/validar-cliente", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ historiaId, validadoCliente: validado }),
              });

              const data = await resp.json();
              if (!resp.ok)
                throw new Error(data.error || "Error en validación");
              console.log(`✔️ Historia ${historiaId} validada por cliente`);
            } catch (err) {
              console.error(`❌ Error validando historia ${historiaId}:`, err);
            }
          }
        });

        break;
      }

      case "scrum master": {
        btnInstr.addEventListener("click", () => {
          mostrarInstrucciones("/pdfs/VillaLego_Guia_SM.pdf");
        });
        zonaSuperior.appendChild(btnInstr);

        const seccionScrum = document.createElement("section");
        seccionScrum.innerHTML = `
          <h2>Subir Burndown Chart</h2>
          <input type="file" id="inputBurndown" accept="image/*" />
          <button id="btnSubirBurndown">Subir Burndown</button>
          <div id="previewContainer" style="margin-top: 1em;">
            <img id="previewBurndown" style="display:none; max-width:100%; border: 1px solid #ccc; padding: 8px; border-radius: 8px;" />
          </div>
        `;

        document.body.appendChild(seccionScrum);

        document
          .getElementById("btnSubirBurndown")
          .addEventListener("click", () => {
            const input = document.getElementById("inputBurndown");
            const file = input.files[0];
            if (!file) return alert("Selecciona una imagen");

            const formData = new FormData();
            formData.append("imagen", file);

            fetch(`/sprint/subirBurndown/${grupoId}`, {
              method: "POST",
              body: formData,
            })
              .then((res) => res.json())
              .then((data) => {
                if (data.error) throw new Error(data.error);
                alert("✅ Imagen subida correctamente");

                const imgPreview = document.getElementById("previewBurndown");
                if (imgPreview && data.ruta) {
                  imgPreview.src = data.ruta;
                  imgPreview.style.display = "block";
                }
              })
              .catch((err) => {
                alert("❌ Error al subir imagen: " + err.message);
              });
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
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("Current phase:", data.fase);
    switch (data.fase) {
      case "Retrospectiva del sprint":
        window.location.href = `/turno/retrospectiva/vista/${turnoId}`;
        break;
      case "Terminado":
        window.location.href = `/alumno/dashboard/principal`;
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Error checking turn phase:", error);
  }
}
window.addEventListener("unload", () => {
  clearInterval(intervalId);
});
