// Front/javascript/scriptRevision.js

const turnoId = window.location.pathname.split("/").pop();

(async function () {
  const cont = document.getElementById("contenido");

  // ────────────────────────────────────────────────────────────────
  // 1) HEADER dinámico: fase y rol
  // ────────────────────────────────────────────────────────────────
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
    header.innerHTML = `Se encuentra en la <strong>Fase</strong>: Revisión del sprint, su <strong>Rol</strong> es: ${rol}`;

    cont.parentNode.insertBefore(header, cont);
  } catch (errHeader) {
    console.error("Error al obtener el rol para el header:", errHeader);
  }

  // ────────────────────────────────────────────────────────────────
  // 2) ZONA SUPERIOR: iframe para Instrucciones
  // ────────────────────────────────────────────────────────────────
  const zonaSuperior = document.createElement("div");
  zonaSuperior.id = "zona-superior";
  cont.parentNode.insertBefore(zonaSuperior, cont);

  const iframe = document.createElement("iframe");
  iframe.id = "instruccionesFrame";
  iframe.style.width = "100%";
  iframe.style.height = "70vh";
  iframe.style.display = "none";
  iframe.style.border = "1px solid #ccc";
  iframe.style.borderRadius = "8px";
  iframe.style.boxShadow = "0 0 10px rgba(0,0,0,0.15)";
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

  // ────────────────────────────────────────────────────────────────
  // 3) LÓGICA PRINCIPAL SEGÚN ROL
  // ────────────────────────────────────────────────────────────────
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
    btnInstr.classList.add("boton-instrucciones");

    switch (rolNorm) {
      case "desarrollador": {
        // ───────────────────────── DESARROLLADOR ─────────────────────────
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
        // ───────────────────────── PRODUCT OWNER ─────────────────────────
        btnInstr.addEventListener("click", () => {
          mostrarInstrucciones("/pdfs/VillaLego_Guia_PO.pdf");
        });
        zonaSuperior.appendChild(btnInstr);

        // 3.1) Creamos la tabla con la columna extra “Imagen”
        cont.innerHTML = `
          <p>
            Como <strong>Product Owner</strong>, tu única responsabilidad en esta fase es validar junto al cliente si las historias
            de usuario fueron aceptadas. Además, aquí podrás ver la imagen que cada historia haya subido.
          </p>
          <table id="tabHistorias">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Imagen</th>         <!-- ← NUEVA COLUMNA -->
                <th>Aceptación Cliente</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
        `;

        // 3.2) Pedimos las historias de usuario del backlog correspondiente (grupoId)
        const r3 = await fetch(`/backlog/api/historias/${grupoId}`);
        if (!r3.ok) {
          cont.innerHTML += "<p>Error cargando historias.</p>";
          return;
        }

        const historias = await r3.json();
        const tbody = document.querySelector("#tabHistorias tbody");

        // 3.3) Por cada historia, pedimos también su imagen (si existe)
        //       Usamos el endpoint GET /resultado/:backlogId (que devolvimos en backend).
        for (const h of historias) {
          if (h.priority !== null) {
            // 3.3.1) Intentar obtener la ruta de la imagen para esta historia
            let imageUrl = "";
            try {
              const resImg = await fetch(`/resultado/${h.id}`);
              if (resImg.ok) {
                const dataImg = await resImg.json();
                imageUrl = dataImg.imagen; // e.g. "/uploads/resultados/162738291-foo.jpg"
              }
            } catch (errImg) {
              console.warn("No se pudo cargar imagen de backlogId=", h.id, errImg);
            }

            // 3.3.2) Crear la fila: incluimos <img> o “Sin imagen”
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${h.id}</td>
              <td>${h.titulo}</td>
              <td>${h.descripcion}</td>
              <td>
                ${imageUrl
                ? `<img src="${imageUrl}" alt="Imagen Historia" class="img-historia" />`
                : "Sin imagen"}
              </td>
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
        }

        // 3.4) Listener para cuando el PO acepte o rechace una historia
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
        // ───────────────────────── SCRUM MASTER ─────────────────────────
        btnInstr.addEventListener("click", () => {
          mostrarInstrucciones("/pdfs/VillaLego_Guia_SM.pdf");
        });
        zonaSuperior.appendChild(btnInstr);

        // El resto de la lógica que ya tenías para SM: subir burndown, etc.
        const seccionScrum = document.createElement("section");
        seccionScrum.style.marginTop = "2rem";
        seccionScrum.innerHTML = `
          <h2>Subir Burndown Chart</h2>
          <div class="container">
            <input type="file" id="inputBurndown" accept="image/*" />
            <button id="btnSubirBurndown">Subir Burndown</button>
            <div id="previewContainer" style="margin-top: 1em;">
              <img id="previewBurndown" style="display:none; max-width:100%; 
                border: 1px solid #ccc; padding: 8px; border-radius: 8px;" />
            </div>
          </div>

        `;
        cont.appendChild(seccionScrum);

        document.getElementById("btnSubirBurndown").addEventListener("click", () => {
          const input = document.getElementById("inputBurndown");
          const file = input.files[0];
          if (!file) return alert("Selecciona una imagen");

          const formData = new FormData();
          formData.append("imagen", file);
          formData.append("backlogId", grupoId);

          // Asegúrate de enviar backlogId en el body:
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
        const qrCont = document.getElementById("qr-container");
        qrCont.style.display = "block";

        // Obtenemos IP de LAN del servidor
        let host, port;
        try {
          const resp = await fetch('/api/local-ip');
          const json = await resp.json();
          host = json.ip;
          port = json.port;
        } catch {
          host = window.location.hostname;
          port = window.location.port;
        }

        // Construimos la URL de revisión
        const path = window.location.pathname;  // p.ej. /turno/revision/123
        const url = `http://${host}:${port}${path}`;

        // Generamos el QR
        const qrImage = document.getElementById("qr-image");
        qrImage.innerHTML = "";
        new QRCode(qrImage, {
          text: url,
          width: 200,
          height: 200,
          correctLevel: QRCode.CorrectLevel.H
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

function toggleMenu() {
  const menu = document.getElementById("menu-desplegable");
  if (menu) menu.classList.toggle("show");
}

fetch("/inicial")
  .then((res) => res.json())
  .then((data) => {
    document.querySelector(".avatar").textContent = data.inicial.toUpperCase();
  });

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
      case 'Ejecucion del sprint':
        window.location.href = `/turno/sprint/${turnoId}`;
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