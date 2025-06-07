// scriptInstrucciones.js

// 1) Sacamos turnoId de la URL (p.ej. /turno/instrucciones/1)
const turnoId = window.location.pathname.split("/").pop();

// 2) Definir función toggleMenu globalmente para onclick del avatar
window.toggleMenu = function () {
  const menu = document.getElementById("menu-desplegable");
  if (menu) menu.classList.toggle("show");
};

// 3) Lógica principal al cargar DOM
document.addEventListener("DOMContentLoaded", async () => {
  // carga de inicial del avatar
  fetch("/inicial")
    .then((res) => res.json())
    .then((data) => {
      document.querySelector(".avatar").textContent = data.inicial.toUpperCase();
    })
    .catch(() => { });

  // 4) Carga inicial del rol y renderizado de contenido
  try {
    const res = await fetch(`/alumno/api/rolTurno/${turnoId}`);
    const { rol } = await res.json();
    const contenedor = document.getElementById("container");

    // header fase + rol
    const header = document.createElement("div");
    header.id = "header-fase-rol";
    header.style.backgroundColor = "#f0f0f0";
    header.style.padding = "10px";
    header.style.marginBottom = "1rem";
    header.style.borderBottom = "2px solid #ccc";
    header.style.fontWeight = "bold";
    header.innerHTML = `Se encuentra en la <strong>Fase</strong>: Instrucciones, su <strong>Rol</strong> es: ${rol}`;
    contenedor.appendChild(header);

    // iframe de instrucciones
    const iframe = document.createElement("iframe");
    iframe.style.width = "70%";
    iframe.style.height = "80vh";
    iframe.style.border = "none";
    switch (rol) {
      case "Scrum Master":
        iframe.src = "/pdfs/VillaLego_Guia_SM.pdf";
        break;
      case "Product owner":
        iframe.src = "/pdfs/VillaLego_Guia_PO.pdf";
        break;
      case "Desarrollador":
        iframe.src = "/pdfs/VillaLego_Guia_Desarrolladores.pdf";
        break;
    }
    contenedor.appendChild(iframe);

  } catch (err) {
    console.error("Error al obtener el rol", err);
  }

  // 5) Darse de baja
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
      alert("No se pudo completar la baja. Intenta de nuevo más tarde.");
    }
  });

  // 6) Abrir conexión SSE para escuchar cambios de fase
  const evtSource = new EventSource(`/turno/api/events/${turnoId}`);
  evtSource.onmessage = (event) => {
    try {
      const { fase } = JSON.parse(event.data);
      switch (fase) {
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
        case 'Retrospectiva del sprint':
          window.location.href = `/turno/retrospectiva/vista/${turnoId}`;
          break;
        case 'Terminado':
          window.location.href = `/alumno/dashboard/principal`;
          break;
      }
    } catch (e) {
      console.error("Error parseando SSE en Instrucciones:", e);
    }
  };
  evtSource.onerror = (err) => console.error("Error en conexión SSE (Instrucciones):", err);
});
