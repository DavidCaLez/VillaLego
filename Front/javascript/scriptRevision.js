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

        if (!kitId) {
          cont.innerHTML +=
            "<p>No hay kit asignado, así que no hay historias.</p>";
          return;
        }
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
          `;
          
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
            <td>
              <select id = "size" data-id="${h.id}">
                <option value="false">– elige –</option>
                <option value="false">No validado</option>
                <option value="True">Validado</option>
              </select>
            </td>
            `;
          tbody.append(tr);
          //TODO: Añadir lógica para guardar el validado
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
          <button class="btn-subir">Subir</button>
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
            case 'Retrospectiva del sprint':
                // Redirect to the sprint retrospective page
                break;
            default:
                break;
        }

    } catch (error) {
        console.error('Error checking turn phase:', error);
    }
}