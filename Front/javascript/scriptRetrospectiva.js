const turnoId = window.location.pathname.split("/").pop();
let grupoId = null;
let alumnoId = null;
let kitId = null;   // Declaramos kitId en ámbito global

async function verificarRolYMostrar() {
    try {
        const res = await fetch(`/alumno/api/rolTurno/${turnoId}`);
        const data = await res.json();
        const rol = data.rol;
        grupoId = data.grupoId;
        alumnoId = data.alumnoId;
        kitId = data.kitId;   // Ahora esto asigna a la variable global

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
        header.innerHTML = `
      Se encuentra en la <strong>Fase</strong>: Retrospectiva del sprint,
      su <strong>Rol</strong> es: ${rol}
    `;
        contenedor.insertBefore(header, mensaje);

        // 2) Mostrar mensaje y form según rol
        const form = document.getElementById("formRetrospectiva");

        if (rol?.trim().toLowerCase() === "scrum master") {
            mensaje.innerHTML =
                "<p>Como Scrum Master, rellena la retrospectiva del grupo.</p>";
            form.style.display = "block";
        } else {
            mensaje.innerHTML = `<p>Tu rol es <strong>${rol}</strong>. Solo el Scrum Master puede rellenar esta retrospectiva, 
        por lo que tenéis que ayudarle a rellenar la retrospectiva.</p>`;
        }
    } catch (err) {
        console.error("Error al obtener el rol:", err);
    }
}

// -------------------------------------------------
// Escuchamos el submit del formulario de Retrospectiva
// -------------------------------------------------
document
    .getElementById("retrospectivaForm")
    .addEventListener("submit", async function (e) {
        e.preventDefault();

        // Leemos los tres campos como strings:
        const queFueBien = document.getElementById("queFueBien").value.trim();
        const queNoFueBien = document.getElementById("queNoFueBien").value.trim();
        const mejorasTexto = document.getElementById("mejoras").value.trim();

        // Validación mínima:
        if (!queFueBien || !queNoFueBien || !mejorasTexto) {
            alert("Por favor, completa todos los campos.");
            return;
        }

        const payload = {
            queFueBien,
            queNoFueBien,
            mejoras: mejorasTexto,  // ahora enviamos la cadena de texto
            grupoId,
            alumnoId,
            kit_id: kitId
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

const intervalId = setInterval(continuar, 2000);

// -------------------------------------------------
// Función que verifica la fase y muestra “¡Enhorabuena!”
// -------------------------------------------------
async function continuar() {
    try {
        const response = await fetch(`/turno/fase/${turnoId}`);
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("Current phase:", data.fase);

        if (data.fase === "Terminado") {
            // 1) Mostrar overlay de “pantallaCarga”
            const overlay = document.getElementById("pantallaCarga");
            overlay.classList.add("visible");

            // 2) Después de 3 segundos, redirigir al dashboard
            setTimeout(() => {
                window.location.href = "/alumno/dashboard/principal";
            }, 3000);

            // 3) Detenemos el intervalo para que no vuelva a dispararse
            clearInterval(intervalId);
        }
        // Si no está Terminado, no hacemos nada y seguimos verificando cada 2s
    } catch (error) {
        console.error("Error checking turn phase:", error);
    }
}

window.addEventListener("unload", () => {
    clearInterval(intervalId);
});
