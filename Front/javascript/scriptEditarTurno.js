document.addEventListener('DOMContentLoaded', () => {
    const turnosContainer = document.getElementById('turnos-container');
    const btnAgregarTurno = document.getElementById('btnAgregarTurno');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnVolver = document.getElementById('btnVolver');
    const actividadIdInput = document.getElementById('actividadId');

    // Función para agregar una entrada de turno
    function agregarTurno(fecha = '', hora = '') {
        const turnoDiv = document.createElement('div');
        turnoDiv.classList.add('turno-entry');

        // Input para la fecha
        const fechaInput = document.createElement('input');
        fechaInput.type = 'date';
        fechaInput.name = 'fecha';
        fechaInput.value = fecha;
        fechaInput.required = true;

        // Input para la hora
        const horaInput = document.createElement('input');
        horaInput.type = 'time';
        horaInput.name = 'hora';
        horaInput.value = hora;
        horaInput.required = true;

        // Botón para eliminar esta entrada
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.classList.add('eliminar-btn');
        btnEliminar.addEventListener('click', () => {
            turnosContainer.removeChild(turnoDiv);
        });

        turnoDiv.appendChild(fechaInput);
        turnoDiv.appendChild(horaInput);
        turnoDiv.appendChild(btnEliminar);

        turnosContainer.appendChild(turnoDiv);
    }

    // Función para obtener el ID de la actividad desde la URL si no viene en el input
    function obtenerActividadIdFromURL() {
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1]; // Ajusta según tu estructura URL
    }

    // Inicializa el ID de la actividad
    const actividadId = actividadIdInput.value || obtenerActividadIdFromURL();
    if (!actividadId) {
        alert("No se ha especificado el ID de la actividad.");
        return;
    }
    actividadIdInput.value = actividadId;

    // Cargar los turnos existentes de la actividad
    fetch(`/turno/api/${actividadId}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(turno => {
                    // Se asume que cada objeto turno tiene las propiedades: fecha y hora
                    agregarTurno(turno.fecha, turno.hora);
                });
            } else {
                // Si no existen turnos previos, se agrega una entrada vacía
                agregarTurno();
            }
        })
        .catch(err => {
            console.error('Error al cargar los turnos:', err);
            agregarTurno();
        });

    // Evento para agregar un nuevo turno
    btnAgregarTurno.addEventListener('click', () => {
        agregarTurno();
    });

    // Evento para volver a la página anterior
    btnVolver.addEventListener('click', () => {
        window.location.href = '/profesor/dashboard';
    });

    // Evento para guardar la edición de turnos
    btnGuardar.addEventListener('click', () => {
        const turnosEntries = document.querySelectorAll('.turno-entry');
        const turnos = [];

        turnosEntries.forEach(entry => {
            const fecha = entry.querySelector('input[name="fecha"]').value;
            const hora = entry.querySelector('input[name="hora"]').value;
            if (fecha && hora) {
                turnos.push({ fecha, hora });
            }
        });

        if (turnos.length === 0) {
            alert("Agrega al menos un turno antes de guardar.");
            return;
        }

        fetch(`/turno/editar/${actividadId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ turnos })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Error al actualizar turnos.");
                }
                return response.json();
            })
            .then(data => {
                alert("Turnos actualizados con éxito.");
                if (data.redirectTo) {
                    window.location.href = data.redirectTo;
                }
            })
            .catch(error => {
                console.error("Error:", error);
                alert("No se pudieron actualizar los turnos. Revisa la consola.");
            });
    });
});
