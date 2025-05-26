// Front/javascript/scriptPriorizacion.js
(async function () {
  const turnoId = window.location.pathname.split('/').pop();
  const cont = document.getElementById('contenido');

  try {
    const resp = await fetch(`/turno/rol/${turnoId}`);
    const data = await resp.json();
    console.log('>> /turno/rol response:', resp.status, data);

    if (!resp.ok) {
      cont.textContent = `Error: ${data.error}`;
      return;
    }

    const rolNorm = data.rol.trim().toLowerCase();
    const kitId = data.kitId;

    if (rolNorm.includes('desarrollador')) {
      cont.innerHTML = '<h2>Manual del Kit</h2><ul id="manuales"></ul>';
      if (!kitId) {
        cont.innerHTML += '<p>No hay kit asignado aún.</p>';
        return;
      }
      const r2 = await fetch(`/api/manuales/${kitId}`);
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
    }
    else if (rolNorm.includes('owner')) {
      cont.innerHTML = `
        <p>
          Como <strong>Product Owner</strong>, tu responsabilidad es priorizar la pila usando la técnica
          <strong>MoSCoW</strong>: Must-have, Should-have, Could-have, Won’t-have.
        </p>
        <table id="tabHistorias">
          <thead><tr><th>ID</th><th>Título</th><th>Prioridad</th></tr></thead>
          <tbody></tbody>
        </table>`;
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
    }
    else if (rolNorm.includes('scrum')) {
      cont.innerHTML = `
        <p>
          Como <strong>Scrum Master</strong>, tu rol es apoyar al Product Owner en la priorización,
          recordándole la técnica <strong>MoSCoW</strong>: Must-have, Should-have, Could-have, Won’t-have.
        </p>`;
    }
    else {
      cont.textContent = 'Rol desconocido.';
    }
  }
  catch (err) {
    console.error(err);
    cont.textContent = 'Error inesperado. Revisa la consola.';
  }
})();