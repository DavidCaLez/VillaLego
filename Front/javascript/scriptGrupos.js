const container = document.getElementById('gruposContainer');
const turnoId = new URLSearchParams(window.location.search).get("turnoId");

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

// Ejecutar al cargar
cargarGrupos();

// Repetir cada 3 segundos
setInterval(cargarGrupos, 3000);
