// scriptRetrospectiva.js

// 1) Extraer turnoId de la URL (asume /turno/retrospectiva/vista/:turnoId)
const turnoId = window.location.pathname.split("/").pop();
let grupoId = null;
let alumnoId = null;
let kitId = null;

// Lógica principal tras DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    (async () => {
        try {
            const res = await fetch(`/alumno/api/rolTurno/${turnoId}`);
            const data = await res.json();
            const rol = data.rol;
            grupoId = data.grupoId;
            alumnoId = data.alumnoId;
            kitId = data.kitId;

            const contenedor = document.getElementById("contenedor");
            const mensaje = document.getElementById("mensajeRol");
            const wrapper = document.getElementById("formRetrospectiva"); // wrapper div

            const header = document.createElement("div");
            header.id = "header-fase-rol";
            header.style.backgroundColor = "#f0f0f0";
            header.style.padding = "10px";
            header.style.marginBottom = "1rem";
            header.style.borderBottom = "2px solid #ccc";
            header.style.fontWeight = "bold";
            header.innerHTML = `Se encuentra en la <strong>Fase</strong>: Retrospectiva del sprint, su <strong>Rol</strong> es: ${rol}`;
            contenedor.insertBefore(header, mensaje);

            if (rol.trim().toLowerCase() === "scrum master") {
                mensaje.innerHTML = '<p>Como Scrum Master, rellena la retrospectiva del grupo.</p>';
                wrapper.style.display = "block"; // mostrar wrapper
            } else {
                mensaje.innerHTML = `<p>Tu rol es <strong>${rol}</strong>. Solo el Scrum Master puede rellenar esta retrospectiva.</p>`;
                wrapper.style.display = "none";
            }
        } catch (err) {
            console.error("Error al obtener el rol:", err);
        }
    })();

    // Manejar envío de formulario
    const formElement = document.getElementById("retrospectivaForm");
    formElement.addEventListener("submit", async (e) => {
        e.preventDefault();
        const queFueBien = document.getElementById("queFueBien").value.trim();
        const queNoFueBien = document.getElementById("queNoFueBien").value.trim();
        const mejorasTexto = document.getElementById("mejoras").value.trim();

        if (!queFueBien || !queNoFueBien || !mejorasTexto) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const payload = { queFueBien, queNoFueBien, mejoras: mejorasTexto, grupoId, alumnoId, kit_id: kitId };
        try {
            const res = await fetch("/backlog/retrospectiva", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await res.json();
            alert(result.mensaje || result.error);
        } catch (err) {
            console.error("Error al guardar retrospectiva:", err);
            alert("Error al guardar retrospectiva.");
        }
    });

    // Toggle menú y avatar
    document.getElementById("darseDeBaja").addEventListener("click", async (e) => {
        e.preventDefault();
        if (!confirm("¿Estás seguro de que quieres darte de baja?")) return;
        try {
            const res = await fetch("/baja", { method: "DELETE", credentials: "same-origin" });
            if (!res.ok) throw new Error(`Status ${res.status}`);
            const { redirectTo } = await res.json();
            window.location.href = redirectTo;
        } catch (err) {
            console.error("Baja fallida:", err);
            alert("No se pudo completar la baja.");
        }
    });

    fetch("/inicial")
        .then(res => res.json())
        .then(data => { document.querySelector(".avatar").textContent = data.inicial.toUpperCase(); })
        .catch(() => { });

    // Server-Sent Events para fase Terminado
    const evtSource = new EventSource(`/turno/api/events/${turnoId}`);
    evtSource.onmessage = (event) => {
        try {
            const { fase } = JSON.parse(event.data);
            /*if (fase === 'Terminado') {
                document.getElementById("pantallaCarga").classList.add("visible");
                setTimeout(() => window.location.href = "/alumno/dashboard/principal", 3000);
            }*/
            switch (fase) {
                case 'Lectura instrucciones':
                    window.location.href = `/turno/instrucciones/${turnoId}`;
                    break;
                case 'Priorizacion de la pila del producto':
                    window.location.href = `/turno/priorizacion/${turnoId}`;
                    break;
                case 'Planificacion del sprint':
                    window.location.href = `/turno/planificacion/${turnoId}`;
                    break;
                case 'Ejecucion del sprint':
                    window.location.href = `/turno/sprint/${turnoId}`;
                    break;
                case 'Revision del sprint':
                    window.location.href = `/turno/revision/${turnoId}`;
                    break;
                case 'Terminado':
                    document.getElementById("pantallaCarga").classList.add("visible");
                    setTimeout(() => window.location.href = "/alumno/dashboard/principal", 3000);
                    break;
                default:
                    console.warn('Fase sin ruta asignada:', fase);
            }
        } catch (e) {
            console.error('Error parseando SSE en Retrospectiva:', e);
        }
    };
    evtSource.onerror = (err) => console.error('Error SSE Retrospectiva:', err);
});
