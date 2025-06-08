// scriptAlumno.js actualizado con restricción de grupo lleno y contador de plazas
const params = window.location.pathname.split('/');
params.pop();
const turnoId = params.pop();
const contenedor = document.getElementById('grupos-container');
const form = document.getElementById('grupo-form');
let grupoActual = null;
let nombreGrupoActual = null;
let rolActual = null;

async function obtenerGrupoActual() {
    const res = await fetch('/alumno/api/grupo-actual');
    const data = await res.json();
    grupoActual = data.grupoId;
    nombreGrupoActual = data.grupoNombre;
    rolActual = data.rol;

    const mensajeContenedor = document.getElementById('mensaje-inscripcion');
    if (grupoActual) {
        mensajeContenedor.innerHTML = `
            <div class="mi-grupo">
                ⭐ Ya estás inscrito en el grupo <strong>${nombreGrupoActual}</strong>.
            </div>
        `;
    }
}

async function cargarGrupos() {
    console.log("Cargando grupos para el turno:", turnoId);
    const res = await fetch(`/alumno/api/grupo/${turnoId}`);
    const grupos = await res.json();
    contenedor.innerHTML = '';

    if (!Array.isArray(grupos) || grupos.length === 0) {
        contenedor.innerHTML = '<p>No hay grupos disponibles.</p>';
        return;
    }

    grupos.forEach((g, i) => {
        const inscritos = g.inscritos ?? 0;
        const estaLleno = inscritos >= g.tamanio;
        const plazasDisponibles = Math.max(0, g.tamanio - inscritos);

        const card = document.createElement('label');
        card.className = 'grupo-card';

        card.innerHTML = `
            <input type="radio" name="grupoSeleccionado" value="${g.id}" ${estaLleno ? 'disabled' : ''} />
            <div class="info">
                <h3>${g.nombre ?? `Grupo ${i + 1}`}</h3>
                <p><strong>Tamaño máximo:</strong> ${g.tamanio}</p>
                ${estaLleno ? `<p style="color:red;">🚫 Grupo completo</p>` : ''}
            </div>
        `;

        contenedor.appendChild(card);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const grupoRadio = document.querySelector('input[name="grupoSeleccionado"]:checked');

    if (!grupoRadio) {
        alert("Debes seleccionar un grupo.");
        return;
    }

    const grupoId = parseInt(grupoRadio.value);

    if (grupoActual !== null) {
        if (grupoId === grupoActual) {
            alert(`Ya estás inscrito en este grupo: ${nombreGrupoActual}`);
            return;
        } else {
            const confirmar = confirm(`Ya estás inscrito en el grupo \"${nombreGrupoActual}\". ¿Deseas cambiarte al nuevo grupo?`);
            if (!confirmar) return;
        }
    }

    const res = await fetch('/alumno/api/inscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupoId })
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
    await cargarGrupos();
});

function toggleMenu() {
    const menu = document.getElementById('menu-desplegable');
    if (menu) menu.classList.toggle('show');
}

fetch('/inicial')
    .then(res => res.json())
    .then(data => {
        document.querySelector('.avatar').textContent = data.inicial.toUpperCase();
    });

// Opción “Darse de baja”
document.getElementById('darseDeBaja').addEventListener('click', async e => {
    e.preventDefault();
    if (!confirm('¿Estás seguro de que quieres darte de baja? Se eliminará tu cuenta y todas tus actividades.')) {
        return;
    }
    try {
        const res = await fetch('/baja', {
            method: 'DELETE',
            credentials: 'same-origin'
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => res.statusText);
            throw new Error(`Status ${res.status}: ${txt}`);
        }
        const { redirectTo } = await res.json();
        window.location.href = redirectTo;
    } catch (err) {
        console.error('Baja fallida:', err);
        alert('No se pudo completar la baja. Intenta de nuevo más tarde.');
    }
});