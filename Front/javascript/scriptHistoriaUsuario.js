const urlParams = new URLSearchParams(window.location.search);
const kitId = parseInt(urlParams.get("kit")); // lee el kit_id de la URL

function extraerComo(texto) {
    const partes = texto.split(/Quiero/i)[0];
    return partes.replace(/Como/i, "").trim();
}

function extraerQuiero(texto) {
    const match = texto.match(/Quiero\s+(.*?)\s+Para/i);
    return match ? match[1].trim() : "";
}

function extraerPara(texto) {
    const match = texto.match(/para (.*)$/i);
    return match ? match[1].trim() : '-';
}

// 1) Construir nav según los kits existentes
async function cargarNavKits() {
    const nav = document.getElementById('kitNav');
    try {
        const res = await fetch('/kit/api/kits');
        const kits = await res.json();
        kits.forEach(k => {
            const a = document.createElement('a');
            a.href = `?kit=${k.id}`;
            a.textContent = k.nombre || k.titulo || `Kit ${k.id}`;
            if (k.id === kitId) {
                a.classList.add('active');
            }
            nav.appendChild(a);
        });
    } catch (err) {
        console.error('No se pudieron cargar los kits:', err);
        nav.innerHTML = '<span class="error">Error cargando kits</span>';
    }
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

        // Regex para detectar “Como … Quiero … Para …”
        const regex = /Como\s+[\s\S]*?\s+Quiero\s+[\s\S]*?\s+Para\s+[\s\S]*/i;
        let descHtml;

        if (regex.test(h.descripcion)) {
            // Extraemos las partes
            const como = extraerComo(h.descripcion);
            const quiero = extraerQuiero(h.descripcion);
            const para = extraerPara(h.descripcion);
            descHtml = `
        <p><strong>Como</strong> ${como}</p>
        <p><strong>Quiero</strong> ${quiero}</p>
        <p><strong>Para</strong> ${para}</p>
      `;
        } else {
            // Mostramos la descripción completa
            descHtml = `<p>${h.descripcion}</p>`;
        }

        card.innerHTML = `
      <div class="encabezado">
        <div class="caja-prioridad"><strong>Prioridad:</strong><br>${h.priority ?? '-'}</div>
        <h3>Historia de Usuario ${h.id}: ${h.titulo}</h3>
        <div class="caja-tamano"><strong>Tamaño:</strong><br>${h.size ?? '-'}</div>
      </div>

      ${descHtml}

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

// Llama primero a cargarNavKits, luego a cargarHistorias:
cargarNavKits().then(cargarHistorias);
