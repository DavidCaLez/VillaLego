window.addEventListener('load', function () {

    function getPathParam(index) {
        const parts = window.location.pathname.split('/');
        return parts[index];
    }

    // ------------------------------------------------------------------
    // Asigna eventos a los botones
    // ------------------------------------------------------------------
    const btnVolver = document.getElementById('btnVolver');
    if (btnVolver) {
        btnVolver.addEventListener('click', function () {
            // Redirige a una ruta fija (ejemplo: dashboard del profesor)
            window.location.href = '/profesor/dashboard';
        });
    } else {
        console.error("No se encontró el botón 'Volver'.");
    }

    const btnGuardar = document.getElementById('btnGuardar');
    if (btnGuardar) {
        btnGuardar.addEventListener('click', function () {
            if (!validarFormulario()) {
                return;
            }

            const actividadId = document.getElementById('actividadId').value;
            const nombre = document.getElementById('nombre').value;

            const tamaño_min = document.getElementById('tamaño_min').value;
            const tamaño_max = document.getElementById('tamaño_max').value;

            fetch('/actividad/editar/' + actividadId, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, tamaño_min, tamaño_max })
            })
                .then(response => {
                    // Si la respuesta no está en el rango 2xx, se lanza error
                    if (!response.ok) {
                        throw new Error('Error al guardar los cambios.');
                    }
                    // Si es 2xx, parseamos la respuesta JSON
                    return response.json();
                })
                .then(data => {
                    // data contendrá { mensaje: "Actividad actualizada con éxito" }
                    alert('Cambios guardados con éxito.');
                    window.location.href = '/profesor/dashboard';
                })
                .catch(error => {
                    console.error('Error al guardar la actividad:', error);
                    alert('No se pudieron guardar los cambios. Revisa la consola.');
                });

        });
    }

    // Botones para editar Kits y Turnos
    const btnEditarKits = document.getElementById('btnEditarKits');
    if (btnEditarKits) {
        btnEditarKits.addEventListener('click', function () {
            const actividadId = document.getElementById('actividadId').value;
            window.location.href = '/kit/editar/' + actividadId;
        });
    }

    const btnEditarTurnos = document.getElementById('btnEditarTurnos');
    if (btnEditarTurnos) {
        btnEditarTurnos.addEventListener('click', function () {
            const actividadId = document.getElementById('actividadId').value;
            window.location.href = '/turno/editar/' + actividadId;
        });
    }

    // ------------------------------------------------------------------
    // Carga inicial de datos de la actividad
    // ------------------------------------------------------------------
    const actividadId = getPathParam(3); // Asumiendo que la URL es algo como /actividad/editar/:id
    if (!actividadId) {
        alert('No se ha especificado la actividad a editar.');
        return;
    }
    document.getElementById('actividadId').value = actividadId;

    fetch('/actividad/' + actividadId)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo obtener la actividad.');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('nombre').value = data.nombre || '';
            document.getElementById('tamaño_min').value = data.tamaño_min || 3;
            document.getElementById('tamaño_max').value = data.tamaño_max || 3;

            if (data.fecha) {
                const dateObj = new Date(data.fecha);
                const isoDate = dateObj.toISOString().split('T')[0];
                document.getElementById('fecha').value = isoDate;
            }
        })
        .catch(error => {
            console.error('Error al cargar la actividad:', error);
        });
});

// ------------------------------------------------------------------
// Función para obtener parámetros de la URL
// ------------------------------------------------------------------
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// ------------------------------------------------------------------
// Función para validar el formulario
// ------------------------------------------------------------------
function validarFormulario() {
    const min = parseInt(document.getElementById('tamaño_min').value);
    const max = parseInt(document.getElementById('tamaño_max').value);

    if (min >= max) {
        abrirPopup();
        return false;
    }
    return true;
}

// ------------------------------------------------------------------
// Funciones para el manejo del popup de error
// ------------------------------------------------------------------
function abrirPopup() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").style.display = "block";
}

function cerrarPopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").style.display = "none";
}
