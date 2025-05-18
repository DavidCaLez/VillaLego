// Get activity ID from URL parameters
const params = window.location.pathname.split("/");
const token = params.pop();
const activityId = params.pop();

fetch(`/turno/api/${activityId}`)
  .then((res) => res.json())
  .then((data) => {
    const turnsContainer = document.getElementById("turnos-container");
    turnsContainer.innerHTML = ""; // Clear previous content
    let contador = 1;
    data.forEach((turn) => {
      const turnElement = document.createElement("div");
      turnElement.classList.add("turn-item");
      turnElement.innerHTML = `
                    <h3>Turno ${contador}</h3>
                    <p>Horario: ${turn.fecha} ${turn.hora}</p>
                    <button onclick= "location.href = '/alumno/api/grupos/${activityId}/${turn.id}/${token}'">Seleccionar</button>
                `;
      turnsContainer.appendChild(turnElement);
      contador++;
    });
  })
  .catch((error) => {
    console.error("Error fetching turns:", error);
    // Show error message to user
    alert("Error al cargar los turnos");
  });

function toggleMenu() {
  const menu = document.getElementById("menu-desplegable");
  if (menu) menu.classList.toggle("show");
}

fetch("/inicial")
  .then((res) => res.json())
  .then((data) => {
    document.querySelector(".avatar").textContent = data.inicial.toUpperCase();
  });

// Opción “Darse de baja”
document.getElementById("darseDeBaja").addEventListener("click", async (e) => {
  e.preventDefault();
  if (
    !confirm(
      "¿Estás seguro de que quieres darte de baja? Se eliminará tu cuenta y todas tus actividades."
    )
  ) {
    return;
  }
  try {
    const res = await fetch("/baja", {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => res.statusText);
      throw new Error(`Status ${res.status}: ${txt}`);
    }
    const { redirectTo } = await res.json();
    window.location.href = redirectTo;
  } catch (err) {
    console.error("Baja fallida:", err);
    alert("No se pudo completar la baja. Intenta de nuevo más tarde.");
  }
});
