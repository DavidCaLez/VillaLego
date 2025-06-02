const turnoId = window.location.pathname.split('/').pop();
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`/alumno/api/rolTurno/${turnoId}`);
        const { rol, grupoId, kitId } = await res.json();
        const contenedor = document.getElementById('container');
        const iframe = document.createElement('iframe');
        switch (rol) {
            case 'Scrum Master':

                iframe.src = '/pdfs/VillaLego_Guia_SM.pdf';
                iframe.style.width = '70%';
                iframe.style.height = '80vh';
                iframe.style.border = 'none';
                contenedor.appendChild(iframe);
                break;
            case 'Product owner':
                iframe.src = '/pdfs/VillaLego_Guia_PO.pdf';
                iframe.style.width = '70%';
                iframe.style.height = '80vh';
                iframe.style.border = 'none';
                contenedor.appendChild(iframe);
                break;
            case 'Desarrollador':
                iframe.src = '/pdfs/VillaLego_Guia_Desarrolladores.pdf';
                iframe.style.width = '70%';
                iframe.style.height = '80vh';
                iframe.style.border = 'none';
                contenedor.appendChild(iframe);
                break;
        }

    } catch (err) {
        console.error('Error al obtener el rol', err);
    }
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
const intervalId = setInterval(continuar, 2000);
async function continuar() {
    try {
        const response = await fetch(`/turno/fase/${turnoId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Current phase:', data.fase);
        switch (data.fase) {
            case 'Priorizacion de la pila del producto':
                // Redirect to the prioritization page
                window.location.href = '/turno/priorizacion/' + turnoId;
                break;
            case 'Planificacion del sprint':
                // Redirect to the sprint planning page
                window.location.href = '/turno/planificacion/' + turnoId;
                break;
            case 'Ejecucion del sprint':
                // Redirect to the sprint execution page
                window.location.href = '/turno/sprint/' + turnoId;

                break;
            case 'Revision del sprint':
                // Redirect to the sprint review page
                window.location.href = '/turno/revision/' + turnoId;
                break;
            case 'Retrospectiva del sprint':
                // Redirect to the sprint retrospective page
                window.location.href = `/turno/retrospectiva/vista/${turnoId}`;
                break;
            default:
                break;
        }

    } catch (error) {
        console.error('Error checking turn phase:', error);
    }
}