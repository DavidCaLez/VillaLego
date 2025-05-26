// Front/javascript/scriptPriorizacion.js
(async function () {
  const turnoId = window.location.pathname.split('/').pop();
  const cont = document.getElementById('contenido');

  try {
    // 🔄 Obtención del rol al estilo "scriptInstrucciones.js"
    const resp = await fetch(`/alumno/api/rolTurno/${turnoId}`);
    if (!resp.ok) {
      const error = await resp.text();
      cont.textContent = `Error: ${error}`;
      return;
    }
    const { rol, grupoId, kitId } = await resp.json();
    rolNorm = rol.trim().toLowerCase();
    console.log('🔍 Rol recibido:', rol);

    // 🔁 Lógica según el rol usando switch
    switch (rolNorm) {
      case 'desarrollador': {
        cont.innerHTML = '<h2>Manual del Kit</h2><ul id="manuales"></ul>';

        // obtenemos el kit desde la otra ruta (como antes)
        //const kitResp = await fetch(`/kit/asignado/${turnoId}`);
        //const kitData = await kitResp.json();
        //const kitId = kitData.kitId;
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
        cont.innerHTML = `
          <p>
            Como <strong>Product Owner</strong>, tu responsabilidad es priorizar la pila usando la técnica
            <strong>MoSCoW</strong>: Must-have, Should-have, Could-have, Won’t-have.
          </p>
          <table id="tabHistorias">
            <thead><tr><th>ID</th><th>Título</th><th>Prioridad</th></tr></thead>
            <tbody></tbody>
          </table>`;

        //const kitResp = await fetch(`/kit/asignado/${turnoId}`);
        //const kitData = await kitResp.json();
        //const kitId = kitData.kitId;
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
                <option value="M">Must-have</option>
                <option value="S">Should-have</option>
                <option value="C">Could-have</option>
                <option value="W">Won’t-have</option>
              </select>
            </td>`;
          tbody.append(tr);
        });
        break;
      }

      case 'scrum master': {
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
