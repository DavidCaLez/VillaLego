// public/js/scriptEditarKits.js

document.addEventListener('DOMContentLoaded', async () => {
    // Elementos del DOM
    const actividadIdInput = document.getElementById('actividadId');
    const grupoId = Number(document.getElementById('grupoId').value);
    const kitsContainer = document.getElementById('kits-container');
    const btnAgregarKit = document.getElementById('btnAgregarKit');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnVolver = document.getElementById('btnVolver');

    // Obtener ID de la URL o input
    function getActividadId() {
        if (actividadIdInput.value) return actividadIdInput.value;
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1];
    }
    const actividadId = getActividadId();
    actividadIdInput.value = actividadId;

    let allKits = [], turnos = [], assignedTurnosMap = {}, unassignedKits = [];

    // Cargar kits, turnos y asignaciones
    try {
        const [kitsRes, turnosRes, asignadosRes] = await Promise.all([
            fetch('/kit/listarKits'),
            fetch(`/turno/api/${actividadId}`),
            fetch(`/kit/api/kits-asignados/${actividadId}`)
        ]);
        allKits = await kitsRes.json();      // lista completa de kits
        turnos = await turnosRes.json();     // lista de turnos
        const assignedKits = await asignadosRes.json(); // ahora incluyen asignaciones con SUM

        // Prepara un mapa { kitId: { turnoId: cantidad } }
        assignedKits.forEach(kit => {
            assignedTurnosMap[kit.id] = {};
            kit.asignaciones.forEach(a => {
                assignedTurnosMap[kit.id][a.turnoId] = a.cantidad;
            });
        });

        // Filtra los kits ya asignados
        const assignedIds = assignedKits.map(k => k.id);
        unassignedKits = allKits.filter(k => !assignedIds.includes(k.id));

        // Renderiza cada kit ya asignado
        assignedKits.forEach(kit => renderKitCard(kit, true));
        // Si no hay ninguno, deja disponible la tarjeta de nuevo kit
        if (assignedKits.length === 0) renderKitCard(null, false);

    } catch (err) {
        console.error('Error cargando datos iniciales:', err);
        alert('No se pudieron cargar los datos iniciales.');
    }

    // Función para crear/actualizar la tarjeta de un kit
    function renderKitCard(kit, isAssigned) {
        const card = document.createElement('div');
        card.className = 'kit-card';
        let actualKit = kit;
        const kitId = kit?.id;

        // Título / select para nuevo
        const h3 = document.createElement('h3');
        if (isAssigned) {
            h3.textContent = kit.nombre;
        } else {
            h3.textContent = 'Nuevo kit';
            const select = document.createElement('select');
            select.innerHTML = `<option value="" disabled selected>Seleccione un kit</option>`;
            unassignedKits.forEach(k => select.appendChild(new Option(k.nombre, k.id)));
            select.addEventListener('change', () => {
                actualKit = allKits.find(k => k.id == select.value);
                h3.textContent = actualKit.nombre;
                unassignedKits = unassignedKits.filter(k => k.id !== actualKit.id);
                select.remove();
                buildTurnosInputs();
            });
            card.appendChild(select);
        }
        card.appendChild(h3);

        // Descripción y stock total
        if (isAssigned && kit.descripcion) {
            const desc = document.createElement('p');
            desc.innerHTML = `<em>${kit.descripcion}</em>`;
            card.appendChild(desc);
        }
        if (isAssigned) {
            const totalP = document.createElement('p');
            totalP.innerHTML = `Cantidad asignada en total: <strong>${kit.cantidad_asignada}</strong>`;
            card.appendChild(totalP);
        }

        // Contenedor de inputs por turno
        const turnosDiv = document.createElement('div');
        turnosDiv.className = 'turnos-container';
        card.appendChild(turnosDiv);

        // Genera o refresca los inputs de turnos
        function buildTurnosInputs() {
            turnosDiv.innerHTML = '';
            if (!actualKit) return;
            const detalle = document.createElement('details');
            // Calculamos la suma inicial de lo que venga en assignedTurnosMap
            const inicial = Object.values(assignedTurnosMap[actualKit.id] || {})
                .reduce((s, v) => s + v, 0);
            // Creamos el summary con el valor real guardado
            detalle.innerHTML = `<summary>Asignar por turno (Stock: ${inicial})</summary>`;
            turnos.forEach(t => {
                const label = document.createElement('label');
                label.className = 'turno-line';
                label.textContent = `${t.fecha} - ${t.hora.slice(0, 5)}`;
                const input = document.createElement('input');
                input.type = 'number';
                input.min = 0;
                // precarga el valor de la API (ahora suma real)
                const prev = assignedTurnosMap[actualKit.id]?.[t.id] || 0;
                input.value = prev;
                input.dataset.kit = actualKit.id;
                input.dataset.turno = t.id;
                label.appendChild(input);
                detalle.appendChild(label);

                // Cada vez que cambie un input, recalculamos el Stock
                input.addEventListener('input', (e) => {
                    const valores = Array.from(detalle.querySelectorAll('input')).map(i => Number(i.value) || 0);
                    const suma = valores.reduce((a, b) => a + b, 0);
                    const stockDisponible = actualKit.packs.reduce((s, p) => s + p.cantidad_total, 0);

                    if (suma > stockDisponible) {
                        alert(`❌ Stock insuficiente para ${actualKit.nombre}. Máximo disponible: ${stockDisponible}`);
                        // Corregimos el input actual para que no pase del máximo
                        const restante = stockDisponible - (suma - Number(e.target.value));
                        e.target.value = Math.max(0, restante);
                    }

                    detalle.querySelector('summary').textContent = `Asignar por turno (Stock: ${suma}/${stockDisponible})`;
                });
            });
            turnosDiv.appendChild(detalle);

            // (Opcional) si quieres asegurarte de recalcular tras montar,
            // dispara el evento en cada input:
            detalle.querySelectorAll('input').forEach(i =>
                i.dispatchEvent(new Event('input'))
            );
        }

        if (isAssigned) buildTurnosInputs();

        // Botón eliminar tarjeta
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.addEventListener('click', () => card.remove());
        card.appendChild(btnEliminar);

        kitsContainer.appendChild(card);
    }



    // Añadir nuevo kit
    btnAgregarKit.addEventListener('click', () => renderKitCard(null, false));

    // Guardar cambios: agrupa por kit y suma por turno
    btnGuardar.addEventListener('click', async () => {
        // 1) Recolecta selección por kit y turno
        const seleccion = [];
        document.querySelectorAll('.turnos-container details').forEach(det => {
            const kitId = Number(det.querySelector('input[data-kit]').dataset.kit);
            if (isNaN(kitId)) return;
            const turnosArr = Array.from(det.querySelectorAll('input[data-turno]')).map(i => ({
                turnoId: Number(i.dataset.turno),
                cantidad: Number(i.value) || 0
            }));
            seleccion.push({ kitId, turnos: turnosArr });
        });


        // 2) Construye payload incluyendo grupo_id
        const payload = seleccion.map(item => ({
            grupo_id: grupoId,                                  // ← aquí ya no puede ser undefined
            kit_id: item.kitId,
            cantidad_asignada: item.turnos.reduce((s, t) => s + t.cantidad, 0),
            turnos: item.turnos
        }));

        if (payload.length === 0) {
            return alert('❌ No se ha asignado ningún kit.');
        }

        console.log('Payload:', JSON.stringify({ kits: payload }, null, 2)); // revisa que payload[i].grupo_id exista

        // 3) Envía al servidor
        try {
            const resp = await fetch(`/kit/editar/${actividadId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ kits: payload })
            });

            const data = await resp.json();

            if (!resp.ok) {
                console.error('⚠️ Error del servidor:', data.error || 'Desconocido');
                alert('❌ Error al guardar: ' + (data.error || 'Error desconocido'));
                return;
            }

            window.location.href = data.redirectTo;
        } catch (err) {
            console.error('❌ Error inesperado:', err);
            alert('❌ Error inesperado al guardar.');
        }
    });

    btnVolver.addEventListener('click', () => window.history.back());
});
