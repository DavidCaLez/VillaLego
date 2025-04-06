const urlParams = new URLSearchParams(window.location.search);
const kitId = parseInt(urlParams.get("kit")); // ← lee el kit_id de la URL

function extraerComo(texto) {
    const como = texto.split("quiero")[0];
    return como.replace("Como", "").trim();
}

function extraerQuiero(texto) {
    const match = texto.match(/quiero (.*?) para/i);
    return match ? match[1].trim() : '-';
}

function extraerPara(texto) {
    const match = texto.match(/para (.*)$/i);
    return match ? match[1].trim() : '-';
}


async function cargarHistorias() {
    const res = await fetch('/historia-usuario');
    const historias = await res.json();
    const contenedor = document.getElementById('contenedor');

  // Filtrar solo las del kit actual
    const filtradas = historias.filter(h => h.kit_id === kitId);

    if (filtradas.length === 0) {
    contenedor.innerHTML = `<p>No hay historias para el kit seleccionado.</p>`;
    return;
    }

    filtradas.forEach(h => {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `
        <div class="encabezado">
        <div class="caja-prioridad"><strong>Prioridad:</strong><br>${h.priority ?? '-'}</div>
        <h3>Historia de Usuario ${h.id}</h3>
        <div class="caja-tamano"><strong>Tamaño:</strong><br>${h.size ?? '-'}</div>
        </div>

        <p><strong>Como</strong> ${extraerComo(h.descripcion)}</p>
        <p><strong>Quiero</strong> ${extraerQuiero(h.descripcion)}</p>
        <p><strong>Para</strong> ${extraerPara(h.descripcion)}</p>

        <p><strong>Definición de hecho</strong><br>
        El diseño debe corresponder con el mostrado en el manual de LEGO.</p>

        <div class="extra">
        <p><strong>Validado PO:</strong> ${h.validadoPO ? '✅' : '❌'} &nbsp;
        <strong>Validado Cliente:</strong> ${h.validadoCliente ? '✅' : '❌'}</p>
        <p><strong>Completado:</strong> ${h.completado ? '✅' : '❌'} &nbsp;
        <strong>¿Es Mejora?:</strong> ${h.esMejora ? '✅' : '❌'}</p>
        </div>
        `;
        card.innerHTML += `
            <div class="imagen">
            <img src="../img/historias/${h.id}.png" alt="Imagen historia ${h.id}" onerror="this.style.display='none'">
            </div>
      `;
    
    contenedor.appendChild(card);
    });
}

cargarHistorias();
