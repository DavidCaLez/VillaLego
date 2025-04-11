document.addEventListener('DOMContentLoaded', () => {
    const kitsContainer = document.getElementById('kits-container');
    const btnAgregarKit = document.getElementById('btnAgregarKit');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnVolver = document.getElementById('btnVolver');
    const actividadIdInput = document.getElementById('actividadId');

    // Función para agregar un entry de kit.
    // Si kitId no es nulo, se asume que se trata de una asignación ya existente.
    function agregarKit(kitId = null, nombre = '', cantidad = '') {
        const kitDiv = document.createElement('div');
        kitDiv.classList.add('kit-entry');

        // Si existe kitId, lo incluimos como campo oculto
        if (kitId !== null) {
            const kitIdInput = document.createElement('input');
            kitIdInput.type = 'hidden';
            kitIdInput.name = 'kit_id';
            kitIdInput.value = kitId;
            kitDiv.appendChild(kitIdInput);

            // Mostrar el nombre del kit en texto (solo lectura)
            const nombreSpan = document.createElement('span');
            nombreSpan.textContent = nombre;
            kitDiv.appendChild(nombreSpan);
        } else {
            // Si se trata de un nuevo kit, se puede solicitar el ID mediante un input (o crear un select)
            const kitIdInput = document.createElement('input');
            kitIdInput.type = 'number';
            kitIdInput.name = 'kit_id';
            kitIdInput.placeholder = 'ID del kit';
            kitDiv.appendChild(kitIdInput);
        }

        // Input para la cantidad asignada
        const cantidadInput = document.createElement('input');
        cantidadInput.type = 'number';
        cantidadInput.name = 'cantidad_asignada';
        cantidadInput.placeholder = 'Cantidad asignada';
        cantidadInput.value = cantidad;
        cantidadInput.required = true;
        kitDiv.appendChild(cantidadInput);

        // Botón para eliminar la asignación de kit
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.classList.add('eliminar-btn');
        btnEliminar.addEventListener('click', () => {
            kitsContainer.removeChild(kitDiv);
        });
        kitDiv.appendChild(btnEliminar);

        kitsContainer.appendChild(kitDiv);
    }

    // Función para obtener el ID de la actividad (puede venir en el input oculto o desde la URL)
    function obtenerActividadIdFromURL() {
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1];
    }

    // Inicializar el ID de la actividad
    const actividadId = actividadIdInput.value || obtenerActividadIdFromURL();
    if (!actividadId) {
        alert("No se ha especificado el ID de la actividad.");
        return;
    }
    actividadIdInput.value = actividadId;

    // Cargar las asignaciones de kits existentes vía API
    fetch(`/kit/api/kits-asignados/${actividadId}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(asignacion => {
                    // Se espera que cada objeto tenga: id (kit_id), nombre, y cantidad_asignada
                    agregarKit(asignacion.id, asignacion.nombre, asignacion.cantidad_asignada);
                });
            } else {
                // Si no hay asignaciones previas, agregar un entry vacío
                agregarKit();
            }
        })
        .catch(err => {
            console.error('Error al cargar kits:', err);
            agregarKit();
        });

    // Agregar nueva asignación de kit
    btnAgregarKit.addEventListener('click', () => {
        agregarKit();
    });

    // Enviar la edición: recolectar las asignaciones y enviarlas al servidor
    btnGuardar.addEventListener('click', () => {
        const kitEntries = document.querySelectorAll('.kit-entry');
        const kits = [];

        kitEntries.forEach(entry => {
            let kitIdField = entry.querySelector('input[name="kit_id"]');
            let kitId = kitIdField ? kitIdField.value : null;
            const cantidad = entry.querySelector('input[name="cantidad_asignada"]').value;
            if (kitId && cantidad) {
                kits.push({ kit_id: parseInt(kitId), cantidad_asignada: parseInt(cantidad) });
            }
        });

        if (kits.length === 0) {
            alert("Agrega al menos un kit antes de guardar.");
            return;
        }

        fetch(`/kit/editar/${actividadId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kits })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Error al actualizar kits.");
            }
            return response.json();
        })
        .then(data => {
            alert("Kits actualizados con éxito.");
            if (data.redirectTo) {
                window.location.href = data.redirectTo;
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("No se pudieron actualizar los kits. Revisa la consola.");
        });
    });

    // Botón para volver a la página anterior
    btnVolver.addEventListener('click', () => {
        window.location.href = '/profesor/dashboard';
    });
});
