// scriptSalaEspera.js

// 1) Extraer turnoId de la URL (asume /turno/comprobacion/:turnoId)
const partes = window.location.pathname.split('/');
const turnoId = partes.pop();

// 2) Referencia al <span> donde mostramos la fase actual
const elementoFase = document.getElementById('Fase');

/**
 * 3) Carga inicial de la fase (opcional, para no quedarse con "Cargando…")
 */
async function cargarFaseInicial() {
    try {
        const res = await fetch(`/turno/api/faseTurno/${turnoId}`);
        if (!res.ok) throw new Error('No se pudo obtener fase inicial');
        const { fase } = await res.json();
        elementoFase.textContent = fase;
        redirigirSegunFase(fase);
    } catch (err) {
        console.error('Error al cargar fase inicial:', err);
        elementoFase.textContent = 'Error';
    }
}

/**
 * 4) Según la nueva fase, redirigir al alumno
 */
function redirigirSegunFase(fase) {
    switch (fase) {
        case 'Lectura instrucciones':
            window.location.href = `/turno/instrucciones/${turnoId}`;
            break;
        case 'Priorizacion de la pila del producto':
            window.location.href = `/turno/priorizacion/${turnoId}`;
            break;
        case 'Planificacion del sprint':
            window.location.href = `/turno/planificacion/${turnoId}`;
            break;
        case 'Ejecucion del sprint':
            window.location.href = `/turno/sprint/${turnoId}`;
            break;
        case 'Revision del sprint':
            window.location.href = `/turno/revision/${turnoId}`;
            break;
        case 'Retrospectiva del sprint':
            window.location.href = `/turno/retrospectiva/vista/${turnoId}`;
            break;
        case 'Terminado':
            window.location.href = `/alumno/dashboard/principal`;
            break;
        default:
            console.warn('Fase sin ruta asignada:', fase);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Pintar fase actual al cargar
    cargarFaseInicial();

    // 5) Abrir conexión SSE
    const evtSource = new EventSource(`/turno/api/events/${turnoId}`);

    // 6) Manejador de nuevos eventos
    evtSource.onmessage = (event) => {
        try {
            const { fase } = JSON.parse(event.data);
            elementoFase.textContent = fase;
            redirigirSegunFase(fase);
        } catch (err) {
            console.error('Error parseando SSE:', err);
        }
    };

    // 7) Manejo de errores (opcional)
    evtSource.onerror = (err) => {
        console.error('Error en conexión SSE:', err);
        // evtSource.close(); // si quisieras cerrar en caso de error grave
    };
});
