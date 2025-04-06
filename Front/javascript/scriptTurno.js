function agregarTurno() {
    const turnosContainer = document.getElementById('turnosContainer');
    const turnoDiv = document.createElement('div');
    turnoDiv.className = 'turno';
    turnoDiv.innerHTML = `
        <label for="fecha">Fecha del turno:</label>
        <input type="date" name="fecha" required />
        <label>Hora del turno:</label>
        <input type="time" name="hora" required>
        <button type="button" onclick="eliminarTurno(this)">Eliminar</button>
    `;
    turnosContainer.appendChild(turnoDiv);
}

function eliminarTurno(button) {
    button.parentElement.remove();
}

document.getElementById('turnoForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const turnos = document.querySelectorAll('.turno');
    if (turnos.length === 0) {
        alert('Debe crear al menos un turno antes de guardar.');
        return;
    }

    const turnosArray = [];
    for (let i = 0; i < turnos.length; i++) {
        const fecha = turnos[i].querySelector('input[name="fecha"]').value;
        const hora = turnos[i].querySelector('input[name="hora"]').value;

        // Validar duplicados
        for (let j = i + 1; j < turnos.length; j++) {
            const f2 = turnos[j].querySelector('input[name="fecha"]').value;
            const h2 = turnos[j].querySelector('input[name="hora"]').value;
            if (fecha === f2 && hora === h2) {
                alert('No pueden existir turnos duplicados');
                return;
            }
        }

        turnosArray.push({ fecha, hora });
    }

    try {
        const response = await fetch('/turno/crear', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(turnosArray)
        });

        if (!response.ok) {
            alert('Error al guardar los turnos.');
            return;
        }

        const data = await response.json();

        // Redirección automática tras 5 segundos
        const redirigir = () => window.location.href = data.redirectTo;
        setTimeout(redirigir, 5000);

        // Mostrar mensaje con opción de redirigir inmediatamente
        if (confirm(data.mensaje + '\n¿Deseas continuar ahora?')) {
            redirigir();
        }

    } catch (error) {
        console.error('Error en la solicitud:', error);
        alert('Error de conexión con el servidor.');
    }
});