const cantidadesSeleccionadas = {};

async function cargarKits() {
    const res = await fetch('/kit/listarKits');
    const kits = await res.json();
    const contenedor = document.getElementById('kits-container');

    kits.forEach(kit => {
    cantidadesSeleccionadas[kit.id] = 0;

    const div = document.createElement('div');
    div.className = 'kit-card';

    const nombre = `<h3>${kit.nombre}</h3>`;
    const desc = `<p><strong>Descripción:</strong> ${kit.descripcion}</p>`;
    const verPDF = `<p><strong>Necesidades del cliente:</strong> 
    <a href="/kit/pdf/${kit.id}" target="_blank">Ver PDF</a></p>`;

    const packs = kit.packs.map(p => `
        <div>
        <strong>Pack:</strong> ${p.nombre}<br>
        <em>${p.descripcion}</em><br>
        <span><strong>Stock disponible:</strong> ${p.cantidad_total}</span>
        </div>
    `).join('<hr>');

    const controles = `
        <div class="controles">
        <button onclick="cambiarCantidad(${kit.id}, -1)">-</button>
        <span id="cantidad-${kit.id}" class="contador">0</span>
        <button onclick="cambiarCantidad(${kit.id}, 1)">+</button>
        </div>
    `;

    div.innerHTML = nombre + desc + verPDF + packs + controles;
    contenedor.appendChild(div);
    });
}

function cambiarCantidad(kitId, delta) {
    cantidadesSeleccionadas[kitId] = Math.max(0, (cantidadesSeleccionadas[kitId] || 0) + delta);
    document.getElementById(`cantidad-${kitId}`).textContent = cantidadesSeleccionadas[kitId];
}

function asignar() {
    const seleccion = Object.entries(cantidadesSeleccionadas)
    .filter(([_, cantidad]) => cantidad > 0)
    .map(([kitId, cantidad]) => ({ kitId: parseInt(kitId), cantidad }));

    if (seleccion.length === 0) {
    alert("No has seleccionado ningún kit.");
    return;
    }

    fetch('/actividad/asignarKits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seleccion })
    })
    .then(r => r.json())
    .then(data => {
        if (data.error) alert(`❌ Error: ${data.error}`);
        else {
            alert("✅ Kits asignados correctamente");
            // Redirigir tras confirmación
            window.location.href = '/profesor/dashboard';
        }
    })
    .catch(() => alert("❌ Error al asignar kits"));
}

cargarKits();
