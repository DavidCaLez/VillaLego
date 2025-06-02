(async function () {
  const turnoId = window.location.pathname.split("/").pop();
  const cont = document.getElementById("contenido");

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
            Como <strong>Desarrollador</strong>, tu responsabilidad es ayudar a presentar el resultado al cliente y 
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
            <option value= false>No aceptado</option>
            <option value= true>Aceptado</option>
          </select>
        </td>
      `;
            tbody.appendChild(tr);
          }
        });

        // Validación del cliente (hecha por el Product Owner)
        document.addEventListener("change", async (e) => {
          if (e.target.classList.contains("select-validacion-cliente")) {
            const historiaId = e.target.dataset.id;
            const validado = e.target.value === "true";
            try {
              const resp = await fetch("/backlog/validar-cliente", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ historiaId, validadoCliente: validado })
              });

              const data = await resp.json();
              if (!resp.ok) throw new Error(data.error || "Error en validación");
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
        cont.innerHTML += `
          <p>
            Como <strong>Scrum Master</strong>, tu rol es ayudar a presentar el resultado del sprint al cliente y realizar el burndown chart.
          </p>
          <input type="file" class="input-img" />
          <button class="btn-subir">Subir burndown chart</button>
        `;

        document.querySelector(".btn-subir").addEventListener("click", async () => {
          const input = document.querySelector(".input-img");
          const file = input.files[0];

          if (!file) return alert("Selecciona una imagen");

          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result;
            const resp = await fetch(`/sprint/subirBurndown/${grupoId}`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imagenBase64: base64 }),
            });

            const data = await resp.json();
            if (resp.ok) {
              alert("✅ Imagen subida correctamente");
            } else {
              alert("❌ Error al subir imagen: " + data.error);
            }
          };

          reader.readAsDataURL(file);
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
          // Redirect to the sprint retrospective page
          window.location.href = `/turno/retrospectiva/vista/${turnoId}`;
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error checking turn phase:", error);
    }
  }

})();

