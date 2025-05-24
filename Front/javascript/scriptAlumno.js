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

document.addEventListener('DOMContentLoaded', async () => {
    const lista = document.getElementById('listaTurnos');
    console.log('Lista de turnos:');
    if (!lista) return;

    try {
    
        const res = await fetch('/alumno/api/mis-turnos');
        const turnos = await res.json();

        if (!Array.isArray(turnos) || turnos.length === 0) {
            lista.innerHTML = '<p>No estás inscrito en ningún turno.</p>';
            return;
        }

        lista.innerHTML = '';
        turnos.forEach(turno => {
            const div = document.createElement('div');
            div.className = 'turno-card';
            div.innerHTML = `
                <span><strong>Fecha:</strong> ${turno.fecha} <strong>Hora:</strong> ${turno.hora}</span>
                <button class="iniciar-btn" onclick="iniciarTurno(${turno.id})">Iniciar</button>
            `;
            lista.appendChild(div);
        });
    } catch (err) {
        lista.innerHTML = '<p>Error al cargar tus turnos.</p>';
        console.error(err);
    }
});
function iniciarTurno(turnoId) {
    // Redirige o realiza la acción que corresponda para iniciar el turno
    window.location.href = `/alumno/turno/iniciar${turnoId}/`;
}