const turnoId = new URLSearchParams(window.location.search).get("turnoId");
const FASES = [
    'Lectura instrucciones',
    'Priorizacion de la pila del producto',
    'Planificacion del sprint',
    'Ejecucion del sprint',
    'Revision del sprint',
    'Retrospectiva del sprint'
];
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`/turno/api/faseTurno/${turnoId}`);
        const { fase } = await res.json();
        const reemplazar = document.getElementById('Fase');
        if (reemplazar) {
            reemplazar.textContent = fase;
        }
    } catch (err) {
        console.error('Error al obtener el rol', err);
    }
});
async function cambiarFase() {
    const faseActual = document.getElementById('Fase').textContent;
    const indiceActual = FASES.indexOf(faseActual);
    const nuevoFase = FASES[(indiceActual + 1)];
    try {
        if (!nuevoFase) {
            console.log('No hay una fase siguiente para cambiar');
            window.location.href = '/turno/comprobación/' + turnoId;
            return;
        }else{
        const res = await fetch(`/turno/api/cambiarFase/${turnoId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nuevaFase: nuevoFase })
        });
        if (res.ok) {
            document.getElementById('Fase').textContent = nuevoFase;
        } else {
            console.error('Error al cambiar la fase');
        }
        }
    } catch (err) {
        console.error('Error al cambiar la fase', err);
    }
}