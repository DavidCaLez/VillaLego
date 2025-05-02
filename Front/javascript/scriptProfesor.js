fetch('/inicial')
    .then(res => res.json())
    .then(data => {
        document.querySelector('.avatar').textContent = data.inicial.toUpperCase();
    });

function toggleMenu() {
    document.getElementById('menu-desplegable').classList.toggle('show');
}
// Aqui se obtienen las actividades del profesor y se muestran en la lista
// 1) Obtener y renderizar actividades
fetch('/actividad/lista')
    .then(res => res.json())
    .then(data => {
        const contenedor = document.getElementById('listaActividades');

        // Reconstruimos todo el HTML de golpe
        contenedor.innerHTML = data.map(act => `
      <div class="actividad" data-id="${act.id}">
        <div>
          <strong>${act.nombre}</strong> (ID: ${act.id})
        </div>
        <div class="botones">
          <buttton class="verLink" 'onclick=verlink(${act.id})'>Ver Link</button>  
          <button class="editar" onclick="location.href='/actividad/editar/${act.id}'">Editar</button>
          <button class="ver"   onclick="location.href='/actividad/verActividad/${act.id}'">Ver</button>
          <button class="eliminar">Borrar</button>
        </div>
      </div>
    `).join('');

        // 2) Ahora que existen, añadimos los listeners
        contenedor.querySelectorAll('.eliminar').forEach(btn => {
            btn.addEventListener('click', async e => {
                const actividadDiv = e.target.closest('.actividad');
                const id = actividadDiv.dataset.id;

                if (!confirm('¿Estás seguro de que quieres borrar esta actividad?')) return;

                try {
                    const res = await fetch(`/profesor/actividad/${id}`, { method: 'DELETE' });
                    if (res.ok) {
                        actividadDiv.remove();
                    } else {
                        alert('Error al eliminar la actividad.');
                    }
                } catch (err) {
                    console.error('Error de conexión:', err);
                    alert('No se pudo eliminar la actividad.');
                }
            });
        });
    });
    verLink = async (id) => {
        try {
            const res = await fetch(`/actividad/link/${id}`);
            if (res.ok) {
                const data = await res.json();
                alert(`El link de la actividad es: ${data.link}`);
            } else {
                alert('Error al obtener el link.');
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            alert('No se pudo obtener el link.');
        }
    }