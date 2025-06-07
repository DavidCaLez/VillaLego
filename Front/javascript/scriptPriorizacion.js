// Front/javascript/scriptPriorizacion.js

const turnoId = window.location.pathname.split('/').pop();

(async function () {
  const cont = document.getElementById('contenido');

  // 1) Creamos zonaSuperior: contendrá el header dinámico + botones + iframe
  const zonaSuperior = document.createElement('div');
  zonaSuperior.id = 'zona-superior';
  cont.parentNode.insertBefore(zonaSuperior, cont);

  // 2) Creamos el DIV “Fase y Rol”
  const header = document.createElement("div");
  header.id = "header-fase-rol";
  header.style.backgroundColor = "#f0f0f0";
  header.style.padding = "10px";
  header.style.marginBottom = "1rem";
  header.style.borderBottom = "2px solid #ccc";
  header.style.fontWeight = "bold";
  zonaSuperior.appendChild(header);

  // 3) Creamos el <iframe> que usaremos para abrir PDFs (instrucciones y necesidades)
  const iframe = document.createElement('iframe');
  iframe.id = 'instruccionesFrame';
  iframe.style.width = '100%';
  iframe.style.height = '70vh';
  iframe.style.display = 'none';
  iframe.style.border = '1px solid #ccc';
  iframe.style.borderRadius = '8px';
  iframe.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.15)';
  zonaSuperior.appendChild(iframe);

  let visible = false; // indica si el iframe está desplegado

  /**
   * Función genérica para mostrar/ocultar el <iframe> con cualquier PDF:
   *  - Si recibe la misma ruta que ya está cargada y visible, lo oculta.
   *  - Si recibe una ruta diferente o estaba oculto, carga la nueva ruta y lo muestra.
   */
  const mostrarPDFenIframe = (rutaPDF) => {
    if (iframe.src.includes(rutaPDF) && visible) {
      // Si el PDF ya está cargado y el iframe es visible, lo ocultamos
      iframe.style.display = 'none';
      visible = false;
    } else {
      // Si era distinto PDF o el iframe estaba oculto, cargamos y mostramos
      iframe.src = rutaPDF;
      iframe.style.display = 'block';
      visible = true;
    }
  };

  // Si se hace clic fuera de zonaSuperior y el iframe está abierto, lo cerramos
  document.addEventListener('click', (e) => {
    const isClickInside = zonaSuperior.contains(e.target);
    if (!isClickInside && visible) {
      iframe.style.display = 'none';
      visible = false;
    }
  });

  try {
    // 4) Pedimos al servidor el rol, grupoId y kitId del turno actual
    const resp = await fetch(`/alumno/api/rolTurno/${turnoId}`);
    if (!resp.ok) {
      const error = await resp.text();
      cont.textContent = `Error al obtener rol: ${error}`;
      return;
    }
    const { rol, grupoId, kitId } = await resp.json();
    const rolNorm = rol.trim().toLowerCase();

    // 5) Escribimos el DIV “Fase y Rol” dinámicamente
    header.innerHTML = `Se encuentra en la <strong>Fase</strong>: Priorización del Backlog, su <strong>Rol</strong> es: ${rol}`;

    // 6) Creamos el botón “Ver Instrucciones” (se usará en todos los roles)
    const btnInstr = document.createElement('button');
    btnInstr.textContent = '📘 Ver Instrucciones';
    btnInstr.classList.add('boton-instrucciones');

    switch (rolNorm) {
      case 'desarrollador': {
        // – DESARROLLADOR: solo “Ver Instrucciones”
        btnInstr.addEventListener('click', () => {
          mostrarPDFenIframe('/pdfs/VillaLego_Guia_Desarrolladores.pdf');
        });
        zonaSuperior.appendChild(btnInstr);

        // Mostrar listado de manuales de kit (igual que antes)
        if (!kitId) {
          cont.innerHTML = '<h2>Manual del Kit</h2><p>No hay kit asignado aún.</p>';
          return;
        }
        cont.innerHTML = '<h2>Manual del Kit</h2><ul id="manuales"></ul>';
        const r2 = await fetch(`/packs/api/manuales/${kitId}`);
        if (!r2.ok) {
          cont.innerHTML += '<p>Error cargando manuales.</p>';
          return;
        }
        const manuals = await r2.json();
        manuals.forEach(m => {
          const li = document.createElement('li');
          li.innerHTML = `<a href="${m.url}" target="_blank">${m.nombre}</a>`;
          document.getElementById('manuales').append(li);
        });
        break;
      }

      case 'product owner': {
        // – PRODUCT OWNER: “Ver Instrucciones” + “Ver necesidades del cliente”
        btnInstr.addEventListener('click', () => {
          mostrarPDFenIframe('/pdfs/VillaLego_Guia_PO.pdf');
        });
        zonaSuperior.appendChild(btnInstr);

        // 7) Creamos el botón “Ver necesidades del cliente” SOLO para PO
        const btnNecesidades = document.createElement('button');
        btnNecesidades.textContent = '📑 Ver necesidades del cliente';
        btnNecesidades.classList.add('boton-instrucciones');
        btnNecesidades.addEventListener('click', () => {
          // Carga el PDF de “necesidades” a través de la ruta /kit/pdf-alumno/:kitId
          mostrarPDFenIframe(`/kit/pdf-alumno/${kitId}`);
        });
        zonaSuperior.appendChild(btnNecesidades);

        // El contenido principal para el Product Owner: tabla de historias y botón para guardar prioridades
        cont.innerHTML = `
          <p>
            Como <strong>Product Owner</strong>, tu responsabilidad es priorizar la pila usando la técnica
            <strong>MoSCoW</strong>: Must-have, Should-have, Could-have, Won’t-have.
          </p>
          <table id="tabHistorias">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Descripción</th>
                <th>Prioridad</th>
              </tr>
            </thead>
            <tbody></tbody>
          </table>
          <button id="guardarBtn" class="boton-guardar">💾 Guardar Prioridades</button>`;

        if (!kitId) {
          cont.innerHTML += '<p>No hay kit asignado, así que no hay historias.</p>';
          return;
        }
        const r3 = await fetch(`/historia-usuario/api/kit/${kitId}`);
        if (!r3.ok) {
          cont.innerHTML += '<p>Error cargando historias.</p>';
          return;
        }
        const historias = await r3.json();
        const tbody = document.querySelector('#tabHistorias tbody');
        historias.forEach(h => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${h.id}</td>
            <td>${h.titulo}</td>
            <td>${h.descripcion}</td>
            <td>
              <select data-id="${h.id}">
                <option value="">– elige –</option>
                <option value="Must-have">Must-have</option>
                <option value="Should-have">Should-have</option>
                <option value="Could-have">Could-have</option>
                <option value="Won’t-have">Won’t-have</option>
              </select>
            </td>`;
          tbody.append(tr);
        });

        document.getElementById('guardarBtn').addEventListener('click', async () => {
          const selects = document.querySelectorAll('select[data-id]');
          const prioridades = Array.from(selects).map(sel => ({
            id: sel.dataset.id,
            prioridad: sel.value
          }));
          const validas = prioridades.filter(p => p.prioridad);
          if (validas.length === 0) return alert("Selecciona al menos una prioridad.");

          try {
            const resp = await fetch('/backlog/guardar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ historias: validas, kitId, grupoId })
            });
            if (!resp.ok) throw new Error(await resp.text());
            alert('✅ Prioridades guardadas en el backlog');
          } catch (err) {
            console.error(err);
            alert('❌ Error al guardar en el backlog');
          }
        });
        break;
      }

      case 'scrum master': {
        // – SCRUM MASTER: solo “Ver Instrucciones”
        btnInstr.addEventListener('click', () => {
          mostrarPDFenIframe('/pdfs/VillaLego_Guia_SM.pdf');
        });
        zonaSuperior.appendChild(btnInstr);

        // El contenido principal para Scrum Master
        cont.innerHTML = `
          <p>
            Como <strong>Scrum Master</strong>, tu rol es apoyar al Product Owner en la priorización,
            recordándole la técnica <strong>MoSCoW</strong>: Must-have, Should-have, Could-have, Won’t-have.
          </p>`;
        break;
      }

      default:
        cont.textContent = `Rol desconocido: "${rol}"`;
    }

  } catch (err) {
    console.error(err);
    cont.textContent = 'Error inesperado. Revisa la consola.';
  }
})();


/**
 * Función para alternar el menú desplegable del avatar (misma que ya tenías)
 */
function toggleMenu() {
  const menu = document.getElementById("menu-desplegable");
  if (menu) menu.classList.toggle("show");
}

/**
 * Cargar la inicial del usuario en el avatar (igual que antes)
 */
fetch("/inicial")
  .then((res) => res.json())
  .then((data) => {
    document.querySelector(".avatar").textContent = data.inicial.toUpperCase();
  });

/**
 * Opción “Darse de baja” (igual que tu código original)
 */
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

/**
 * Lógica de cambio de fase periódica (igual que antes)
 */
const evtSource = new EventSource(`/turno/api/events/${turnoId}`);

// 6) Al recibir un evento, parsear y redirigir si es la fase siguiente
evtSource.onmessage = (event) => {
  try {
    const { fase } = JSON.parse(event.data);
    switch (fase) {
      case 'Lectura instrucciones':
        window.location.href = `/turno/instrucciones/${turnoId}`;
        break;
      case 'Planificacion del sprint':
        window.location.href = `/turno/planificacion/${turnoId}`;
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
        // no hacemos nada si es otra fase
        break;
    }
  } catch (e) {
    console.error('Error parseando SSE en Priorización:', e);
  }
};

// 7) Manejo de errores SSE
evtSource.onerror = (err) => {
  console.error('Error en conexión SSE (Priorización):', err);
  // evtSource.close(); // opcional
};
