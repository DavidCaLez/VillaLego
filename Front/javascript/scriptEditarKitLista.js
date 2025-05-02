// Front/javascript/scriptEditarKitLista.js

window.addEventListener('DOMContentLoaded', () => {
    const kitId = window.location.pathname.split('/').pop();
    const contenedor = document.getElementById('codigos-container');
    const btnAgregar = document.getElementById('btnAgregarCodigo');
    const form = document.getElementById('formEditarKit');

    // Renderiza un grupo de input para el código del pack
    function renderCodigo(codigo = '') {
        const div = document.createElement('div');
        div.classList.add('pack-codigo-group');
        div.innerHTML = `
            <label>Código del pack:</label><br>
            <input type="text" name="pack_codigo" value="${codigo}" required>
            <button type="button" class="btnEliminarCodigo">Eliminar</button>
            <br><br>
        `;
        div.querySelector('.btnEliminarCodigo').addEventListener('click', () => {
            contenedor.removeChild(div);
        });
        contenedor.appendChild(div);
    }

    // Carga los datos actuales del kit
    fetch(`/kit/editarKit/${kitId}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('kitId').value = kitId;
            document.getElementById('nombreKit').value = data.nombre;
            document.getElementById('descripcionKit').value = data.descripcion;
            document.getElementById('linkPDF').href = `/kit/pdf/${kitId}`;

            // Si hay packs, renderiza un campo por cada código
            if (Array.isArray(data.packs) && data.packs.length > 0) {
                data.packs.forEach(pack => renderCodigo(pack.codigo));  // usa pack.codigo del modelo :contentReference[oaicite:2]{index=2}&#8203;:contentReference[oaicite:3]{index=3}
                // Rellena la descripción y cantidad del primer pack
                document.getElementById('descripcionPack').value = data.packs[0].descripcion;
                document.getElementById('cantidadPack').value = data.packs[0].cantidad_total;
            } else {
                renderCodigo(); // al menos un campo vacío
            }
        })
        .catch(err => {
            console.error('Error al cargar el kit:', err);
            alert('No se pudo cargar la información del kit');
        });

    // Añade un nuevo campo de código al hacer clic
    btnAgregar.addEventListener('click', () => {
        renderCodigo();
    });

    // Maneja el envío del formulario
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fd = new FormData();

        // Campos estáticos
        fd.append('pack_descripcion', form.pack_descripcion.value);
        fd.append('cantidad_total', form.cantidad_total.value);

        // Códigos dinámicos
        form.querySelectorAll('input[name="pack_codigo"]').forEach(input => {
            fd.append('pack_codigo', input.value);
        });

        // PDF si existe
        if (form.archivo_pdf.files.length) {
            fd.append('archivo_pdf', form.archivo_pdf.files[0]);
        }

        

        // Envía la petición para actualizar el kit
        try {
            const res = await fetch(`/kit/editarKit/${kitId}`, {
                method: 'POST',
                body: fd
            });
            const result = await res.json();
            if (result.error) {
                alert('❌ ' + result.error);
            } else {
                alert('✅ Kit actualizado correctamente');
                window.location.href = '/profesor/dashboard';
            }
        } catch (err) {
            console.error('Error al guardar:', err);
            alert('Error al guardar los cambios');
        }
    });
});
