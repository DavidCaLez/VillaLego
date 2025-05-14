

// asignarKits.js
const cantidadesPorTurno = {};
const stockTotalMap = {}; // guardará stockTotal por kit

async function cargarDatos() {
    const params = new URLSearchParams(window.location.search);
    const actividadId = params.get('actividadId');
    if (!actividadId) {
        return alert('Falta el ID de la actividad en la URL');
    }

    // 1. Traer kits y turnos de la DB
    const [kits, turnos] = await Promise.all([
        fetch('/kit/listarKits').then(r => {
            if (!r.ok) throw new Error('No pude cargar los kits');
            return r.json();
        }),
        fetch(`/turno/api/${actividadId}`).then(r => r.json())
    ]);

    const contenedor = document.getElementById('kits-container');
    contenedor.innerHTML = '';

    kits.forEach(kit => {

        // Inicializar cantidades y calcular stock total disponible
        cantidadesPorTurno[kit.id] = {};
        const totalStock = kit.packs.reduce((sum, p) => sum + p.cantidad_total, 0);
        stockTotalMap[kit.id] = totalStock;

        const turnosHTML = `
       <details>
         <summary>Asignar por turno</summary>
       <p class="stock-info">Stock disponible: ${totalStock}</p>
         ${turnos.map(t => `
           <label class="turno-line">
             ${t.fecha} – ${t.hora.slice(0, 5)}
             <input
               type="number" min="0" value="0"
               data-kit="${kit.id}"
               data-turno="${t.id}"
               class="input-turno"
             />
           </label>
         `).join('')}
       </details>`;

        const div = document.createElement('div');
        div.className = 'kit-card';
        div.innerHTML = `
       <h3>${kit.nombre}</h3>
       <p>${kit.descripcion || ''}</p>
       ${turnosHTML}
     `;
        contenedor.appendChild(div);
    });
}

// 2. Cada vez que cambie un input, validamos contra el stock disponible
document.addEventListener('input', e => {
    if (!e.target.classList.contains('input-turno')) return;
    const kitId = +e.target.dataset.kit;
    const turnoId = +e.target.dataset.turno;
    let cantidad = Math.max(0, +e.target.value || 0);

    // Si excede el stock disponible para ese kit, forzamos el valor máximo
    const disponible = stockTotalMap[kitId];
    if (cantidad > disponible) {
        alert(`❌ No puedes asignar más de ${disponible} unidades a este turno.`);
        cantidad = disponible;
        e.target.value = disponible;
    }

    cantidadesPorTurno[kitId][turnoId] = cantidad;
});

// 3. Al pulsar “Asignar Kits”, validamos de nuevo y armamos el payload
function asignar() {
    const seleccion = [];

    // sacamos el ID de la URL de nuevo
    const params = new URLSearchParams(window.location.search);
    const actividadId = params.get('actividadId');
    if (!actividadId) return alert('Falta el ID de la actividad en la URL');

    for (const [kitId, turnosObj] of Object.entries(cantidadesPorTurno)) {
        const turnos = Object.entries(turnosObj)
            .filter(([_, c]) => c > 0)
            .map(([turnoId, cantidad]) => ({ turnoId: +turnoId, cantidad }));

        // Validación final por turno
        for (const { cantidad } of turnos) {
            if (cantidad > stockTotalMap[kitId]) {
                return alert(`❌ Stock insuficiente para el kit ${kitId} en uno de los turnos.`);
            }
        }

        if (turnos.length) seleccion.push({ kitId: +kitId, turnos });
    }

    if (!seleccion.length) {
        return alert('No asignaste cantidades a ningún turno.');
    }

    fetch('/actividad/crearActividadCompleta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seleccion, actividadId })
    })
        .then(r => r.json())
        .then(res => {
            if (res.error) alert('❌ ' + res.error);
            else window.location = res.redirectTo;
        })
        .catch(() => alert('❌ Error al asignar kits.'));
}
document.getElementById('btn-asignar').addEventListener('click', asignar);

// Arrancamos
cargarDatos();
