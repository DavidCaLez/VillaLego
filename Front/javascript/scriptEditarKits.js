document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const actividadIdInput = document.getElementById('actividadId');
    const kitsContainer = document.getElementById('kits-container');
    const btnAgregarKit = document.getElementById('btnAgregarKit');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnVolver = document.getElementById('btnVolver');

    let allKits = [];         // Todos los kits con información completa (incluyendo packs)
    let assignedKits = [];    // Kits ya asignados a la actividad
    let unassignedKits = [];  // Kits disponibles para asignar (no mostrados)
    let newCardSelections = {};  // Relación: cardId => kit_id (para tarjetas nuevas)

    // Función para obtener la actividad desde input o URL
    function getActividadId() {
        if (actividadIdInput.value) return actividadIdInput.value;
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1];
    }

    const actividadId = getActividadId();
    actividadIdInput.value = actividadId;

    // Función para renderizar una tarjeta de kit
    // Parámetros: objeto con { kit_id, nombre, cantidad } y boolean "isAssigned" (true: ya asignado)
    function renderKitCard({ kit_id, nombre, cantidad }, isAssigned) {
        const card = document.createElement('div');
        card.classList.add('kit-card');
        const cardId = 'card-' + Math.random().toString(36).substr(2, 9);
        card.dataset.cardId = cardId;

        // Campo oculto para guardar el kit_id
        const kitIdHidden = document.createElement('input');
        kitIdHidden.type = 'hidden';
        kitIdHidden.name = 'kit_id';
        if (isAssigned && kit_id) {
            kitIdHidden.value = kit_id;
        }
        card.appendChild(kitIdHidden);

        if (isAssigned) {
            // Tarjeta para kit ya asignado: mostrar el nombre
            const h3 = document.createElement('h3');
            h3.textContent = nombre;
            card.appendChild(h3);
        } else {
            // Nueva asignación: mostrar un desplegable (<select>) con los kits disponibles
            const select = document.createElement('select');
            select.name = 'kit_select';

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Seleccione un kit';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);

            // Añadir sólo las opciones de kits en unassignedKits
            unassignedKits.forEach(kit => {
                const opt = document.createElement('option');
                opt.value = kit.id;
                opt.textContent = kit.nombre;
                select.appendChild(opt);
            });
            card.appendChild(select);

            // Al cambiar la selección, actualizar el campo oculto y remover la opción del array de disponibles
            select.addEventListener('change', () => {
                const selectedId = parseInt(select.value);
                kitIdHidden.value = selectedId;
                newCardSelections[cardId] = selectedId;
                // Remover el kit seleccionado de unassignedKits
                unassignedKits = unassignedKits.filter(kit => kit.id !== selectedId);
                updateAllSelectOptions();
            });
        }

        // Agregar label e input para la cantidad asignada
        const label = document.createElement('label');
        label.textContent = 'Cantidad asignada:';
        card.appendChild(label);

        const cantidadInput = document.createElement('input');
        cantidadInput.type = 'number';
        cantidadInput.name = 'cantidad_asignada';
        cantidadInput.placeholder = 'Ingrese cantidad';
        cantidadInput.min = 0;  // Aquí se impide que se puedan introducir números negativos.
        if (cantidad) {
            cantidadInput.value = cantidad;
        }
        card.appendChild(cantidadInput);

        // Botón de eliminar
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.classList.add('eliminar-btn');
        btnEliminar.addEventListener('click', () => {
            // Si es nueva tarjeta y tenía kit seleccionado, reinsertarlo a unassignedKits
            if (!isAssigned) {
                const selectedId = kitIdHidden.value;
                if (selectedId) {
                    const kitObj = allKits.find(kit => kit.id === parseInt(selectedId));
                    if (kitObj) {
                        unassignedKits.push(kitObj);
                    }
                    delete newCardSelections[cardId];
                    updateAllSelectOptions();
                }
            }
            kitsContainer.removeChild(card);
        });
        card.appendChild(btnEliminar);

        kitsContainer.appendChild(card);
    }

    // Función para actualizar los <select> de tarjetas nuevas con las opciones actuales de unassignedKits
    function updateAllSelectOptions() {
        const selects = kitsContainer.querySelectorAll('select[name="kit_select"]');
        selects.forEach(select => {
            const currentValue = select.value;
            select.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Seleccione un kit';
            defaultOption.disabled = true;
            defaultOption.selected = true;
            select.appendChild(defaultOption);
            unassignedKits.forEach(kit => {
                const opt = document.createElement('option');
                opt.value = kit.id;
                opt.textContent = kit.nombre;
                select.appendChild(opt);
            });
            if (currentValue) {
                select.value = currentValue;
            }
        });
    }

    // Cargar datos iniciales
    fetch('/kit/listarKits')
        .then(response => response.json())
        .then(kits => {
            allKits = kits; // Debe incluir cada kit y su array de packs (para stock)
            return fetch(`/kit/api/kits-asignados/${actividadId}`);
        })
        .then(response => response.json())
        .then(asignados => {
            assignedKits = asignados; // Los kits ya asignados (con kit.id, kit.nombre, cantidad_asignada)
            const assignedIds = assignedKits.map(kit => kit.id);
            unassignedKits = allKits.filter(kit => !assignedIds.includes(kit.id));

            // Renderizar tarjetas para los kits asignados
            assignedKits.forEach(kit => {
                renderKitCard({ kit_id: kit.id, nombre: kit.nombre, cantidad: kit.cantidad_asignada }, true);
            });

            // Si no hay asignaciones, agrega una tarjeta vacía para nueva asignación
            if (assignedKits.length === 0) {
                renderKitCard({ kit_id: null, nombre: '', cantidad: '' }, false);
            }
        })
        .catch(err => {
            console.error('Error al cargar los kits:', err);
        });

    // Agregar nueva tarjeta al pulsar "Agregar Kit"
    btnAgregarKit.addEventListener('click', () => {
        renderKitCard({ kit_id: null, nombre: '', cantidad: '' }, false);
    });

    // Guardar: validar cantidades y enviar datos al servidor
    btnGuardar.addEventListener('click', () => {
        const kitCards = kitsContainer.querySelectorAll('.kit-card');
        const kitsToSave = [];

        for (let card of kitCards) {
            const kitIdField = card.querySelector('input[name="kit_id"]');
            const cantidadField = card.querySelector('input[name="cantidad_asignada"]');
            if (kitIdField && cantidadField && kitIdField.value && cantidadField.value) {
                const kitId = parseInt(kitIdField.value);
                const cantidad = parseInt(cantidadField.value);

                // Aquí se valida que la cantidad no sea negativa
                if (cantidad < 0) {
                    alert("No se permiten cantidades negativas. Corrige la cantidad.");
                    return; // Se aborta el guardado
                }

                // Buscar el kit para obtener su stock máximo (mínimo de cantidad_total en sus packs)
                const kitObj = allKits.find(k => k.id === kitId);
                if (kitObj && kitObj.packs && kitObj.packs.length > 0) {
                    const maxStock = Math.min(...kitObj.packs.map(pack => pack.cantidad_total));
                    if (cantidad > maxStock) {
                        alert(`El kit "${kitObj.nombre}" tiene un stock máximo de ${maxStock}. Corrige la cantidad.`);
                        return; // Abortamos el guardado
                    }
                }

                kitsToSave.push({ kit_id: kitId, cantidad_asignada: cantidad });
            }
        }

        if (kitsToSave.length === 0) {
            alert("Agrega al menos un kit antes de guardar.");
            return;
        }

        // Enviar al servidor la edición
        fetch(`/kit/editar/${actividadId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ kits: kitsToSave })
        })
            .then(response => {
                if (!response.ok) throw new Error("Error al actualizar los kits.");
                return response.json();
            })
            .then(data => {
                alert("Kits actualizados correctamente");
                window.location.href = '/profesor/dashboard';
            })
            .catch(err => {
                console.error("Error:", err);
                alert("No se pudieron actualizar los kits. Revisa la consola.");
            });
    });

    btnVolver.addEventListener('click', () => {
        window.history.back();
    });
});
