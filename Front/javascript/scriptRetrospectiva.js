const turnoId = window.location.pathname.split("/").pop();
let grupoId = null;
let alumnoId = null;

async function verificarRolYMostrar() {
    try {
        const res = await fetch(`/alumno/api/rolTurno/${turnoId}`);
        const data = await res.json();
        const rol = data.rol;
        grupoId = data.grupoId;
        alumnoId = data.alumnoId;
        const kitId = data.kitId;

        // 1) Crear dinámicamente el header con fase y rol
        const contenedor = document.getElementById("contenedor");
        const mensaje = document.getElementById("mensajeRol");

        const header = document.createElement("div");
        header.id = "header-fase-rol";
        header.style.backgroundColor = "#f0f0f0";
        header.style.padding = "10px";
        header.style.marginBottom = "1rem";
        header.style.borderBottom = "2px solid #ccc";
        header.style.fontWeight = "bold";
        header.innerHTML = `Se encuentra en la <strong>Fase</strong>: Retrospectiva del sprint, su <strong>Rol</strong> es: ${rol}`;

        // Insertar el header justo antes de mostrar el mensaje de rol
        contenedor.insertBefore(header, mensaje);

        // 2) Mostrar mensaje y form según rol
        const form = document.getElementById("formRetrospectiva");

        if (rol?.trim().toLowerCase() === "scrum master") {
            mensaje.innerHTML =
                "<p>Como Scrum Master, rellena la retrospectiva del grupo.</p>";
            form.style.display = "block";
        } else {
            mensaje.innerHTML = `<p>Tu rol es <strong>${rol}</strong>. Solo el Scrum Master puede rellenar esta retrospectiva, 
              por lo que teneis que ayudarle a rellenar la retrospectiva.</p>`;
        }
    } catch (err) {
        console.error("Error al obtener el rol:", err);
    }
}

document
    .getElementById("retrospectivaForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();
        const payload = {
            queFueBien: document.getElementById("queFueBien").value,
            queNoFueBien: document.getElementById("queNoFueBien").value,
            mejoras: document.getElementById("mejoras").value,
            grupoId,
            alumnoId,
            kit_id: kitId,
            esMejora: document.getElementById("esMejora").value === "true",
        };

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

verificarRolYMostrar();

// Mostrar/ocultar selector de mejora
document.getElementById("toggleMejora").addEventListener("click", () => {
    const cont = document.getElementById("selectMejoraContainer");
    cont.style.display = cont.style.display === "none" ? "block" : "none";
});

const intervalId = setInterval(continuar, 2000);
async function continuar() {
    try {
        const response = await fetch(`/turno/fase/${turnoId}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Current phase:", data.fase);
        switch (data.fase) {
            case "Terminado":
                // Redirect to the finished page
                window.location.href = `/alumno/dashboard/principal`;
                break;
            default:
                break;
        }
    } catch (error) {
        console.error("Error checking turn phase:", error);
    }
}
window.addEventListener("unload", () => {
    clearInterval(intervalId);
});