document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const kitsContainer = document.getElementById('kits-container');
    const btnAgregarKit = document.getElementById('btnAgregarKit');
    const btnGuardar = document.getElementById('btnGuardar');
    const btnVolver = document.getElementById('btnVolver');
    const actividadIdInput = document.getElementById('actividadId');

    // Arrays para manejar la lógica
    let allKits = [];          // Todos los kits obtenidos de /kit/listarKits
    let assignedKits = [];     // Kits asignados a la actividad
    let unassignedKits = [];   // Kits que NO están asignados, para el desplegable

    // Almacena la relación entre tarjeta y kitId actualmente seleccionado
    // Esto nos ayuda a reinsertar en unassignedKits si la tarjeta se elimina.
    // Estructura: { cardElementId: kitIdSeleccionado }
    const cardSelections = {};

    // Generador simple para IDs de tarjeta único en el cliente
    let cardCounter = 0;
    function generateCardId() {
        cardCounter += 1;
        return `kitCard_${cardCounter}`;
    }

    //--------------------------------------------------
    // 1. Cargar todos los kits y los kits asignados
    //--------------------------------------------------
    const actividadId = getActividadId();
    if (!actividadId) {
        alert("No se ha especificado el ID de la actividad.");
        return;
    }
    actividadIdInput.value = actividadId;

    // Cargar TODOS los kits (para ver cuáles quedan libres)
    fetch('/kit/listarKits')
        .then(res => res.json())
        .then(kits => {
            allKits = kits;
            // Luego, cargar los kits asignados
            return fetch(`/kit/api/kits-asignados/${actividadId}`);
        })
        .then(res => res.json())
        .then(asignados => {
            assignedKits = asignados; // [{ id, nombre, cantidad_asignada }, ...]

            // Calculamos unassignedKits: los que no están en assignedKits
            const assignedIds = assignedKits.map(k => k.id);
            unassignedKits = allKits.filter(k => !assignedIds.includes(k.id));

            // Pintar las tarjetas correspondientes a los kits ya asignados
            if (assignedKits.length > 0) {
                assignedKits.forEach(kit => {
                    agregarTarjetaKit(kit.id, kit.nombre, kit.cantidad_asignada, true);
                });
            } else {
                // Si no hay asignaciones, añadimos una tarjeta vacía
                agregarTarjetaKit(null, '', '', false);
            }
        })
        .catch(err => {
            console.error('Error al cargar los kits:', err);
            // Si falla todo, por lo menos dar una tarjeta vacía
            agregarTarjetaKit(null, '', '', false);
        });

    //--------------------------------------------------
    // 2. Lógica para "Agregar Kit"
    //--------------------------------------------------
    btnAgregarKit.addEventListener('click', () => {
        agregarTarjetaKit(null, '', '', false);
    });

    //--------------------------------------------------
    // 3. Lógica para "Guardar"
    //--------------------------------------------------
    btnGuardar.addEventListener('click', () => {
        // Recorremos las tarjetas para formar el array "kits" a enviar
        const kitCards = document.querySelectorAll('.kit-card');
        const kitsToSave = [];

        kitCards.forEach(card => {
            const kitIdField = card.querySelector('input[name="kit_id"]');
            const cantidadField = card.querySelector('input[name="cantidad_asignada"]');
            if (kitIdField && cantidadField && kitIdField.value && cantidadField.value) {
                kitsToSave.push({
                    kit_id: parseInt(kitIdField.value),
                    cantidad_asignada: parseInt(cantidadField.value)
                });
            }
        });

        if (kitsToSave.length === 0) {
            alert("No tienes ningún kit asignado. Agrega al menos uno.");
            return;
        }

        // Enviar al servidor
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
            alert("Kits actualizados con éxito.");
            if (data.redirectTo) {
                window.location.href = data.redirectTo;
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("No se pudieron actualizar los kits. Revisa la consola.");
        });
    });

    //--------------------------------------------------
    // 4. Lógica para "Volver"
    //--------------------------------------------------
    btnVolver.addEventListener('click', () => {
        window.history.back();
    });

    //--------------------------------------------------
    // Función principal para crear la tarjeta
    //--------------------------------------------------
    function agregarTarjetaKit(kitId, kitName, cantidad, isAlreadyAssigned) {
        const cardId = generateCardId();
        const kitCard = document.createElement('div');
        kitCard.classList.add('kit-card');
        kitCard.id = cardId;

        // Si kitId != null e isAlreadyAssigned = true => es un kit ya asignado.
        // Mostramos su nombre en un <h3> y agregamos input hidden para kit_id.
        if (kitId !== null && isAlreadyAssigned) {
            // Tarjeta para kit ya asignado
            const kitIdHidden = document.createElement('input');
            kitIdHidden.type = 'hidden';
            kitIdHidden.name = 'kit_id';
            kitIdHidden.value = kitId;
            kitCard.appendChild(kitIdHidden);

            const title = document.createElement('h3');
            title.textContent = kitName;
            kitCard.appendChild(title);

            // Guardamos la selección en cardSelections para saber qué kit es este
            cardSelections[cardId] = kitId;
        } 
        else {
            // Tarjeta para "nuevo kit"
            // Se crea un select con los kits que están en unassignedKits
            const kitIdHidden = document.createElement('input');
            kitIdHidden.type = 'hidden';
            kitIdHidden.name = 'kit_id';
            kitCard.appendChild(kitIdHidden);

            const selectKit = document.createElement('select');
            const placeholderOption = document.createElement('option');
            placeholderOption.disabled = true;
            placeholderOption.selected = true;
            placeholderOption.hidden = true;
            placeholderOption.value = '';
            placeholderOption.textContent = 'Seleccione un kit';
            selectKit.appendChild(placeholderOption);

            // Agregar como opciones sólo los unassignedKits
            unassignedKits.forEach(k => {
                const opt = document.createElement('option');
                opt.value = k.id;
                opt.textContent = k.nombre;
                selectKit.appendChild(opt);
            });
            kitCard.appendChild(selectKit);

            // Cuando el usuario seleccione uno, se actualiza input hidden y removemos el kit de unassignedKits
            selectKit.addEventListener('change', () => {
                // Si la tarjeta ya tenía seleccionado algo, lo devolvemos a unassignedKits
                const prevKitId = cardSelections[cardId];
                if (prevKitId) {
                    // Si existía un kit anterior, lo devolvemos a unassignedKits
                    const kitAnterior = allKits.find(k => k.id === prevKitId);
                    if (kitAnterior) {
                        unassignedKits.push(kitAnterior);
                    }
                }

                // Tomamos el kit recién seleccionado
                const newKitId = parseInt(selectKit.value);
                const newKitObj = allKits.find(k => k.id === newKitId);
                // Removemos este kit de unassignedKits
                unassignedKits = unassignedKits.filter(k => k.id !== newKitId);

                // Guardamos la selección
                cardSelections[cardId] = newKitId;
                kitIdHidden.value = newKitId;
            });
        }

        // Campo para la cantidad asignada
        const labelCantidad = document.createElement('p');
        labelCantidad.innerHTML = "<strong>Cantidad asignada:</strong>";
        kitCard.appendChild(labelCantidad);

        const inputCantidad = document.createElement('input');
        inputCantidad.type = 'number';
        inputCantidad.name = 'cantidad_asignada';
        inputCantidad.placeholder = 'Ingrese cantidad';
        inputCantidad.value = cantidad ? cantidad : '';
        kitCard.appendChild(inputCantidad);

        // Botón "Eliminar"
        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.classList.add('eliminar-btn');
        btnEliminar.addEventListener('click', () => {
            // Si esta tarjeta tenía un kit seleccionado, reinsertarlo a unassignedKits
            const selectedKit = cardSelections[cardId];
            if (selectedKit) {
                // Solo lo reinsertamos si no está ya asignado en la base
                // o si era un kit nuevo sin persistir
                // En este ejemplo, si isAlreadyAssigned es false, asumimos que no se guardó en BD
                if (!isAlreadyAssigned) {
                    const kitObj = allKits.find(k => k.id === selectedKit);
                    if (kitObj) {
                        unassignedKits.push(kitObj);
                    }
                }
            }

            // Eliminar la tarjeta
            kitsContainer.removeChild(kitCard);
            delete cardSelections[cardId];
        });
        kitCard.appendChild(btnEliminar);

        kitsContainer.appendChild(kitCard);
    }

    // Función para obtener actividadId (si no está en el input hidden)
    function getActividadId() {
        const parts = window.location.pathname.split('/');
        return parts[parts.length - 1];
    }
});
