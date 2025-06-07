// scriptControlFases.js

// 1) Array con las fases en orden
const FASES = [
  "Lectura instrucciones",
  "Priorizacion de la pila del producto",
  "Planificacion del sprint",
  "Ejecucion del sprint",
  "Revision del sprint",
  "Retrospectiva del sprint",
  "Terminado"
];

// 2) Obtenemos turnoId de la query string (?turnoId=123)
const turnoId = new URLSearchParams(window.location.search).get("turnoId");

// 3) Elementos del DOM
const elementoFase = document.getElementById("Fase");
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");

// 4) Índice de la fase actual
let indiceActual = null;

// 5) Habilita/deshabilita botones según fase
function actualizarBotones() {
  if (indiceActual === null) {
    btnAnterior.disabled = btnSiguiente.disabled = true;
    return;
  }
  btnAnterior.disabled = (indiceActual === 0);
  btnSiguiente.disabled = (indiceActual === FASES.length - 1);
}

// 6) Pinta fase y ajusta botones
function pintarFase(fase) {
  const idx = FASES.indexOf(fase);
  if (idx === -1) {
    console.error("Fase desconocida:", fase);
    return;
  }
  indiceActual = idx;
  elementoFase.textContent = fase;
  actualizarBotones();
}

// 7) Al iniciar, carga la fase actual
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`/turno/api/faseTurno/${turnoId}`);
    if (!res.ok) throw new Error();
    const { fase } = await res.json();
    pintarFase(fase);
  } catch {
    elementoFase.textContent = "Error";
  }
});

// 8) Cambiar a una fase dada (previa o siguiente)
async function cambiarFase(nuevoIdx) {
  // deshabilitar para evitar clicks múltiples
  btnAnterior.disabled = btnSiguiente.disabled = true;

  const nuevaFase = FASES[nuevoIdx];
  try {
    const res = await fetch(`/turno/api/cambiarFase/${turnoId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nuevaFase })
    });
    if (!res.ok) throw new Error();
    pintarFase(nuevaFase);

    // si quieres redirigir al terminar
    if (nuevaFase === "Terminado") {
      window.location.href = "/profesor/dashboard";
    }
  } catch (err) {
    console.error("Error al cambiar fase:", err);
    // restaurar botones al estado correcto
    pintarFase(FASES[indiceActual]);
  }
}

// 9) Listeners de los botones
btnAnterior.addEventListener("click", () => {
  if (indiceActual > 0) {
    const confirmar = confirm("¿Estás seguro de que quieres retroceder a la fase anterior?");
    if (confirmar) {
      cambiarFase(indiceActual - 1);
    }
  }
});

btnSiguiente.addEventListener("click", () => {
  if (indiceActual < FASES.length - 1) cambiarFase(indiceActual + 1);
});
