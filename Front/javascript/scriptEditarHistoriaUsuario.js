const params = new URLSearchParams(window.location.search);
const historiaId = params.get('id');
const kitId = parseInt(params.get('kit'));

async function cargarKits() {
    const sel = document.getElementById('kit');
    const res = await fetch('/kit/api/kits');
    const kits = await res.json();
    kits.forEach(k => {
        const o = document.createElement('option');
        o.value = k.id;
        o.textContent = k.nombre || k.titulo;
        if (k.id === kitId) o.selected = true;
        sel.appendChild(o);
    });
}

async function cargarHistoria() {
    const res = await fetch(`/historia-usuario`);
    const historias = await res.json();
    const h = historias.find(x => x.id === historiaId);
    if (!h) return alert('Historia no encontrada');

    document.getElementById('id').value = h.id;
    document.getElementById('titulo').value = h.titulo;
    document.getElementById('descripcion').value = h.descripcion;

    const imgDiv = document.getElementById('imagenActual');
    if (h.imagen) {
        const imgPath = `/uploads/historias_usuario/${h.imagen}`;
        imgDiv.innerHTML = `
      <img src="${imgPath}" alt="Imagen actual" style="max-width:200px;" />
      <p><a href="${imgPath}" target="_blank">Ver imagen completa</a></p>
    `;
    } else {
        imgDiv.innerHTML = `<p>Actualmente no hay una imagen asociada a esta historia de usuario.</p>`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    cargarKits().then(cargarHistoria);
});
