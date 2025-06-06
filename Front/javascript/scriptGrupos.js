const container = document.getElementById('gruposContainer');
const turnoId = new URLSearchParams(window.location.search).get("turnoId");

// Función que carga y pinta los grupos en pantalla
function cargarGrupos() {
    fetch(`/grupos/datos/${turnoId}`)
        .then(res => res.json())
        .then(grupos => {
            container.innerHTML = "";
            if (!Array.isArray(grupos) || grupos.length === 0) {
                container.textContent = "No hay grupos asignados.";
                return;
            }
            grupos.forEach(grupo => {
                const div = document.createElement("div");
                div.innerHTML = `<h3>Grupo ${grupo.grupoId}</h3>`;
                const ul = document.createElement("ul");

                grupo.integrantes.forEach(integrante => {
                    const li = document.createElement("li");
                    li.textContent = `${integrante.nombre} (${integrante.correo}) - Rol: ${integrante.rol}`;
                    ul.appendChild(li);
                });

                div.appendChild(ul);
                container.appendChild(div);
            });
        })
        .catch(err => {
            console.error("Error al cargar grupos:", err);
            container.textContent = "Error al cargar la información.";
        });
}

// Llamamos a cargarGrupos al inicio y cada 3 segundos
cargarGrupos();
setInterval(cargarGrupos, 3000);

//  Lógica para el botón "Mezclar Roles" 
const shuffleBtn = document.getElementById('shuffleRolesBtn');
shuffleBtn.addEventListener('click', () => {
    // Deshabilitar botón mientras se procesa
    shuffleBtn.disabled = true;
    shuffleBtn.textContent = "Mezclando…";

    fetch(`/grupos/mezclar/${turnoId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("Error al mezclar roles en el servidor");
            }
            return res.json();
        })
        .then(response => {
            // Volver a cargar los grupos con los nuevos roles
            cargarGrupos();
        })
        .catch(err => {
            console.error(err);
            alert("No se pudieron mezclar los roles. Revisa la consola.");
        })
        .finally(() => {
            shuffleBtn.disabled = false;
            shuffleBtn.textContent = "Mezclar Roles";
        });
});
