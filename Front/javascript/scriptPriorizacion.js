// Front/javascript/scriptPriorizacion.js
(async function () {
  const turnoId = window.location.pathname.split('/').pop();
  const cont = document.getElementById('contenido');

  // Contenedor fijo para botones e instrucciones
  const zonaSuperior = document.createElement('div');
  zonaSuperior.id = 'zona-superior';
  cont.parentNode.insertBefore(zonaSuperior, cont);

  const iframe = document.createElement('iframe');
  iframe.id = 'instruccionesFrame';
  iframe.style.width = '100%';
  iframe.style.height = '70vh';
  iframe.style.display = 'none';
  iframe.style.border = '1px solid #ccc';
  zonaSuperior.appendChild(iframe);

  let visible = false;

const mostrarInstrucciones = (ruta) => {
  if (iframe.src.includes(ruta) && visible) {
    iframe.style.display = 'none';
    visible = false;
  } else {
    iframe.src = ruta;
    iframe.style.display = 'block';
    visible = true;
  }
};

// Ocultar instrucciones si se hace clic fuera del iframe
document.addEventListener('click', (e) => {
  const isClickInside = zonaSuperior.contains(e.target);
  if (!isClickInside && visible) {
    iframe.style.display = 'none';
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
    console.log('🔍 Rol recibido:', rol);

    // Crear botón instrucciones
    const btnInstr = document.createElement('button');
    btnInstr.textContent = '📘 Ver Instrucciones';

    switch (rolNorm) {
      case 'desarrollador': {
        btnInstr.addEventListener('click', () => {
          mostrarInstrucciones('/pdfs/VillaLego_Guia_Desarrolladores.pdf');
        });
        zonaSuperior.appendChild(btnInstr);

        cont.innerHTML = '<h2>Manual del Kit</h2><ul id="manuales"></ul>';
        if (!kitId) {
          cont.innerHTML += '<p>No hay kit asignado aún.</p>';
          return;
        }

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
        btnInstr.addEventListener('click', () => {
          mostrarInstrucciones('/pdfs/VillaLego_Guia_PO.pdf');
        });
        zonaSuperior.appendChild(btnInstr);

        cont.innerHTML = `
          <p>
            Como <strong>Product Owner</strong>, tu responsabilidad es priorizar la pila usando la técnica
            <strong>MoSCoW</strong>: Must-have, Should-have, Could-have, Won’t-have.
          </p>
          <table id="tabHistorias">
            <thead><tr><th>ID</th><th>Título</th><th>Prioridad</th></tr></thead>
            <tbody></tbody>
          </table>
          <button id="guardarBtn">💾 Guardar Prioridades</button>`;

        document.getElementById('guardarBtn')?.classList.add('boton-guardar');

        if (!kitId) {
          cont.innerHTML += '<p>No hay kit asignado, así que no hay historias.</p>';
          return;
        }

        const r2 = await fetch(`/historia-usuario/api/kit/${kitId}`);
        if (!r2.ok) {
          cont.innerHTML += '<p>Error cargando historias.</p>';
          return;
        }

        const historias = await r2.json();
        const tbody = document.querySelector('#tabHistorias tbody');
        historias.forEach(h => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${h.id}</td>
            <td>${h.titulo}</td>
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
        btnInstr.addEventListener('click', () => {
          mostrarInstrucciones('/pdfs/VillaLego_Guia_SM.pdf');
        });
        zonaSuperior.appendChild(btnInstr);

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