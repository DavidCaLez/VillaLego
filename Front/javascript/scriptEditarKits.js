document.addEventListener('DOMContentLoaded', async () => {
    const actividadIdInput = document.getElementById('actividadId');
    const kitsContainer = document.getElementById('kits-container');
    const btnAgregarKit = document.getElementById('btnAgregarKit');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnVolver = document.getElementById('btnVolver');

    // Obtener ID de actividad
    function getActividadId() {
        if (actividadIdInput.value) return actividadIdInput.value;
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1];
    }
    const actividadId = getActividadId();
    actividadIdInput.value = actividadId;

    // Datos globales
    let allKits = [];
    let turnos = [];
    let assignedTurnosMap = {}; // { kitId: { turnoId: cantidad } }
    let unassignedKits = [];

    // Cargar datos iniciales
    try {
        const [kitsRes, turnosRes, asignadosRes] = await Promise.all([
            fetch('/kit/listarKits'),
            fetch(`/turno/api/${actividadId}`),
            fetch(`/kit/api/kits-asignados/${actividadId}`)
        ]);
        allKits = await kitsRes.json();       // todos los kits
        turnos = await turnosRes.json();     // turnos de la actividad
        const assignedKits = await asignadosRes.json();

        assignedKits.forEach(kit => {
            assignedTurnosMap[kit.id] = {};
            // kit.asignaciones viene del API (ver paso 1)
            kit.asignaciones.forEach(a => {
                assignedTurnosMap[kit.id][a.turnoId] = a.cantidad;
            });
        });

        // IDs de kits ya asignados globalmente
        const assignedIds = assignedKits.map(k => k.id);
        // Kits que aún no están asignados
        unassignedKits = allKits.filter(k => !assignedIds.includes(k.id));

        // Renderiza cada kit ya asignado
        assignedKits.forEach(kit => {
            renderKitCard(kit, /*isAssigned=*/true);
        });

        // Si no hay ninguno, deja la tarjeta “Nuevo kit”
        if (assignedKits.length === 0) {
            renderKitCard(null, false);
        }
    } catch (err) {
        console.error('Error cargando datos:', err);
        alert('No se pudieron cargar datos iniciales.');
    }

    // Crear tarjeta de kit (asignado o nueva)
    function renderKitCard(kit, isAssigned) {
        const card = document.createElement('div');
        card.className = 'kit-card';
        const kitId = kit ? kit.id : null;
        const nombre = kit ? kit.nombre : '';

        // Título
        const h3 = document.createElement('h3');
        h3.textContent = nombre || 'Nuevo kit';
        card.appendChild(h3);

        // Select para asignar a kit si es nuevo
        let actualKit = kit;
        if (!isAssigned) {
            const select = document.createElement('select');
            select.innerHTML = `<option value="" disabled selected>Seleccione un kit</option>`;
            unassignedKits.forEach(k => select.appendChild(new Option(k.nombre, k.id)));
            select.addEventListener('change', () => {
                const selected = allKits.find(k => k.id == select.value);
                actualKit = selected;
                h3.textContent = selected.nombre;
                unassignedKits = unassignedKits.filter(k => k.id !== selected.id);
                select.remove();
                buildTurnosInputs();
            });
            card.appendChild(select);
        }

        // Contenedor de inputs por turno
        const turnosDiv = document.createElement('div');
        turnosDiv.className = 'turnos-container';
        card.appendChild(turnosDiv);

        // Lógica para crear inputs de turnos
        function buildTurnosInputs() {
            turnosDiv.innerHTML = '';
            if (!actualKit) return;
            const totalStock = actualKit.packs.reduce((sum, p) => sum + p.cantidad_total, 0);
            const detalle = document.createElement('details');
            detalle.innerHTML = `
                <summary>Asignar por turno (Stock: ${totalStock})</summary>
            `;
            turnos.forEach(t => {
                const label = document.createElement('label');
                label.className = 'turno-line';
                label.textContent = `${t.fecha} - ${t.hora.slice(0, 5)}`;
                const input = document.createElement('input');
                input.type = 'number'; input.min = 0; input.value = 0;
                input.dataset.kit = actualKit.id;
                input.dataset.turno = t.id;
                // Si ya estaba asignado, precargar valor
                const prev = assignedTurnosMap[actualKit.id]?.[t.id];
                input.value = (prev !== undefined && prev !== null) ? prev : 0;


                label.appendChild(input);
                detalle.appendChild(label);
            });
            turnosDiv.appendChild(detalle);
        }

        // Si es asignado, construir inputs de inmediato
        if (isAssigned) buildTurnosInputs();

        // Botón eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.addEventListener('click', () => card.remove());
        card.appendChild(btnEliminar);

        kitsContainer.appendChild(card);
    }

    // Agregar nueva tarjeta
    btnAgregarKit.addEventListener('click', () => renderKitCard(null, false));

    // Guardar cambios
    btnGuardar.addEventListener('click', () => {
        const seleccion = [];
        document.querySelectorAll('.turnos-container details').forEach(det => {
            const kitInputs = det.querySelectorAll('input[data-kit]');
            const kitId = Number(kitInputs[0]?.dataset.kit);
            if (isNaN(kitId)) return;
            const turnosArr = Array.from(kitInputs).map(input => ({
                turnoId: Number(input.dataset.turno),
                cantidad: Number(input.value)     // incluir 0s
            }));
            seleccion.push({ kitId, turnos: turnosArr });
        });

        // Mapear a lo que el back espera:
        const kits = seleccion.map(item => ({
            kit_id: item.kitId,
            cantidad_asignada: item.turnos
                .reduce((sum, t) => sum + t.cantidad, 0)
        }));
        
        fetch(`/kit/editar/${actividadId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kits })
        })
            .then(resp => {
                if (!resp.ok) throw new Error('Error al guardar');
                return resp.json();
            })
            .then(data => {
                // aquí recibes { redirectTo: '/actividad/21' }
                if (data.redirectTo) {
                    window.location.href = data.redirectTo;
                } else {
                    console.error('Respuesta inesperada', data);
                }
            })
            .catch(err => {
                console.error(err);
                alert('No se pudo guardar. Revisa la consola.');
            });
    });
    btnVolver.addEventListener('click', () => window.history.back());
});
