// scriptAlumno.js actualizado

const turnoId = window.location.pathname.split('/').pop();
const contenedor = document.getElementById('grupos-container');
const form = document.getElementById('grupo-form');
let rolesDisponibles = [];
let grupoActual = null;
let nombreGrupoActual = null;
let rolActual = null;

async function cargarRoles() {
    const res = await fetch('/alumno/api/roles');
    rolesDisponibles = await res.json();
}

async function obtenerGrupoActual() {
    const res = await fetch('/alumno/api/grupo-actual');
    const data = await res.json();
    console.log("Grupo actual:", data);
    grupoActual = data.grupoId;
    nombreGrupoActual = data.grupoNombre;
    rolActual = data.rol;

    if (grupoActual) {
        const aviso = document.createElement('div');
        aviso.className = 'mi-grupo';
        aviso.innerHTML = `
            <p>⭐ Ya estás inscrito en el grupo <strong>${nombreGrupoActual}</strong>
            ${rolActual ? `con el rol <strong>${rolActual}</strong>` : ''}.</p>
        `;
        contenedor.before(aviso);
    }
}

async function cargarGrupos() {
    const res = await fetch(`/alumno/api/grupos/${turnoId}`);
    const grupos = await res.json();
    contenedor.innerHTML = '';

    if (!Array.isArray(grupos) || grupos.length === 0) {
        contenedor.innerHTML = '<p>No hay grupos disponibles.</p>';
        return;
    }

    grupos.forEach((g, i) => {
        const card = document.createElement('label');
        card.className = 'grupo-card';

        card.innerHTML = `
            <input type="radio" name="grupoSeleccionado" value="${g.id}" />
            <div class="info">
                <h3>${g.nombre ?? `Grupo ${i + 1}`}</h3>
                <p><strong>Tamaño máximo:</strong> ${g.tamanio}</p>
                <div class="roles" id="roles-${g.id}" style="display:none; margin-top: 10px;"></div>
            </div>
        `;

        contenedor.appendChild(card);
    });

    // Mostrar roles cuando seleccionas grupo
    document.querySelectorAll('input[name="grupoSeleccionado"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.querySelectorAll('.roles').forEach(div => div.style.display = 'none');
            const grupoId = radio.value;
            const contenedorRoles = document.getElementById(`roles-${grupoId}`);
            contenedorRoles.innerHTML = rolesDisponibles.map(r => `
                <label style="margin-right: 10px;">
                    <input type="radio" name="rolSeleccionado" value="${r}" />
                    ${r}
                </label>
            `).join('');
            contenedorRoles.style.display = 'block';
        });
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const grupoRadio = document.querySelector('input[name="grupoSeleccionado"]:checked');
    const rolRadio = document.querySelector('input[name="rolSeleccionado"]:checked');

    if (!grupoRadio || !rolRadio) {
        alert("Debes seleccionar un grupo y un rol.");
        return;
    }

    const grupoId = parseInt(grupoRadio.value);
    const rol = rolRadio.value;

    if (grupoActual !== null) {
        if (grupoId === grupoActual) {
            alert(`Ya estás inscrito en este grupo: ${nombreGrupoActual}`);
            return;
        } else {
            const confirmar = confirm(`Ya estás inscrito en el grupo \"${nombreGrupoActual}\". \u00bfDeseas cambiarte al nuevo grupo?`);
            if (!confirmar) return;
        }
    }

    const res = await fetch('/alumno/api/inscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupoId, rol })
    });

    const data = await res.json();
    if (res.ok) {
        alert(data.mensaje);
        location.reload();
    } else {
        alert("❌ " + data.error);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    await obtenerGrupoActual();
    await cargarRoles();
    await cargarGrupos();
});

function toggleMenu() {
    const menu = document.getElementById('menu-desplegable');
    if (menu) menu.classList.toggle('show');
}
