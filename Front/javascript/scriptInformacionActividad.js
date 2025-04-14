const idActividad = window.location.pathname.split('/').pop();

    fetch(`/actividad/${idActividad}`)
    .then(res => res.json())
    .then(data => {
        document.getElementById('nombreActividad').textContent = data.nombre;
        document.getElementById('minimoActividad').textContent = data.tamaño_min;
        document.getElementById('maximoActividad').textContent = data.tamaño_max;
        document.getElementById('profesorActividad').textContent = data.profesor_id;
        document.getElementById('profesorNombre').textContent = data.profesorNombre;
        document.getElementById('profesorCorreo').textContent = data.profesorCorreo;

    });
    function verTurnos() {
        window.location.href = `/turno/ver/${idActividad}`;
    }
    function verKits() {
        window.location.href = `/kit/verkits/${idActividad}`;
    }
    