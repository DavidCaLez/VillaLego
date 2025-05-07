// Front/javascript/scriptEditarKitLista.js

window.addEventListener('DOMContentLoaded', () => {
    const kitId = window.location.pathname.split('/').pop();
    const contenedor = document.getElementById('codigos-container');
    const btnAgregar = document.getElementById('btnAgregarCodigo');
    const form = document.getElementById('formEditarKit');

    // Renderiza un grupo de input para el código del pack
    function renderCodigo(codigo = '', manual = '') {
        const div = document.createElement('div');
        div.classList.add('pack-codigo-group');
        div.innerHTML = `
  <label>Código del pack:</label><br>
  <input type="text" name="pack_codigo" value="${codigo}" required>

  <button class="btnEliminarCodigo">Eliminar</button><br><br>

  <label>Manual actual:</label><br>
  ${manual
                ? `<a href="/uploads/manuales/${manual}" target="_blank">Ver PDF actual</a>`
                : `<span>No hay manual</span>`}
  <br><br>

  <label>Reemplazar Manual en formato PDF (opcional):</label><br>
  <input type="file" name="pack_manual" accept="application/pdf" class="fileManual">
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
            if (data.archivo_pdf) {
                const link = document.getElementById('linkPDF');
                link.href = `/uploads/kits/${data.archivo_pdf}`;
                link.textContent = 'Ver PDF actual';
            } else {
                document.getElementById('linkPDF').textContent = 'No hay PDF';
                document.getElementById('linkPDF').removeAttribute('href');
            }

            // Si hay packs, renderiza un campo por cada código
            if (Array.isArray(data.packs) && data.packs.length > 0) {
                data.packs.forEach(pack => renderCodigo(pack.codigo, pack.manual_pdf));  // usa pack.codigo del modelo :contentReference[oaicite:2]{index=2}&#8203;:contentReference[oaicite:3]{index=3}
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

        // ==== NUEVO: manuales de pack ====
        form.querySelectorAll('input.fileManual').forEach(input => {
            if (input.files.length > 0) {
                // 1) Anexamos el archivo
                fd.append('pack_manual', input.files[0]);
                // 2) Extraemos el código del pack de su grupo y lo enviamos
                const grupo = input.closest('.pack-codigo-group');
                const codigo = grupo.querySelector('input[name="pack_codigo"]').value;
                fd.append('manual_codigo', codigo);
            }
        });
        // =================================

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
