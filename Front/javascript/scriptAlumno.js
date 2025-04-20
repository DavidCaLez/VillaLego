// scriptAlumno.js

// 1. Obtenemos turnoId de la URL
const parts = window.location.pathname.split('/');
const turnoId = parts[parts.length - 1];

// 2. Referencia al contenedor
const contenedor = document.getElementById('grupos-container');

// 3. Función para cargar y mostrar grupos
async function cargarGrupos() {
    try {
        const res = await fetch(`/alumno/api/grupos/${turnoId}`);
        const grupos = await res.json();
        contenedor.innerHTML = '';

        if (!Array.isArray(grupos) || grupos.length === 0) {
            contenedor.innerHTML = '<p>No hay grupos en este turno.</p>';
            return;
        }

        grupos.forEach(g => {
            const card = document.createElement('div');
            card.className = 'grupo-card';
            card.innerHTML = `
                <h3>${g.nombre} (ID: ${g.id})</h3>
                <p><strong>Tamaño máximo:</strong> ${g.tamanio}</p>
                <button onclick="inscribir(${g.id})">Apuntarme a este grupo</button>
            `;
            contenedor.appendChild(card);
        });
    } catch (err) {
        console.error('Error al cargar grupos:', err);
        contenedor.innerHTML = '<p>Error al cargar los grupos.</p>';
    }
}

// 4. Función para inscribir al alumno
async function inscribir(grupoId) {
    try {
        const res = await fetch('/alumno/api/inscribir', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grupoId })
        });
        const data = await res.json();
        if (data.error) {
            alert('❌ ' + data.error);
        } else {
            alert('✅ ' + data.mensaje);
            // Volver a recargar para ver cambios (por ejemplo grupo actual)
            cargarGrupos();
        }
    } catch (err) {
        console.error('Error inscribiendo:', err);
        alert('Error al inscribirse.');
    }
}

// 5. Arrancamos al cargar la página
document.addEventListener('DOMContentLoaded', cargarGrupos);

// 6. Función para mostrar/ocultar el menú de avatar
function toggleMenu() {
    const menu = document.getElementById('menu-desplegable');
    if (menu) {
        menu.classList.toggle('show');
    }
}
