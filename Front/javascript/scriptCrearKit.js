// Front/javascript/scriptCrearKit.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form[action="/kit/crear"]');
  const btnAgregar = document.getElementById('btnAgregarCodigo');
  const contenedor = document.getElementById('codigos-container');

  // Función para crear un bloque de pack (código + manual + eliminar)
  function crearPackGroup(codigo = '') {
    const grupo = document.createElement('div');
    grupo.classList.add('pack-codigo-group');
    grupo.innerHTML = `
      <label>Código del pack:</label><br>
      <input type="text" name="pack_codigo" value="${codigo}" required><br>
      <label>Manual del pack (PDF):</label><br>
      <input type="file" name="pack_manual" accept="application/pdf"><br>
      <button type="button" class="btnEliminarCodigo">Eliminar</button>
      <br><br>
    `;
    // Eliminar este bloque al hacer clic
    grupo.querySelector('.btnEliminarCodigo')
      .addEventListener('click', () => contenedor.removeChild(grupo));
    contenedor.appendChild(grupo);
  }

  // Inicialmente 1 pack vacío
  crearPackGroup();

  // Al pulsar “Añadir código” generamos otro grupo
  btnAgregar.addEventListener('click', () => crearPackGroup());

  // Manejador de envío
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData();

    // 1) PDF general del kit
    const kitPDF = form.querySelector('input[name="archivo_pdf"]');
    if (kitPDF.files.length) {
      fd.append('archivo_pdf', kitPDF.files[0]);
    }

    // 2) Campos fijos
    fd.append('nombre', form.nombre.value);
    fd.append('descripcion', form.descripcion.value);
    fd.append('pack_descripcion', form.pack_descripcion.value);
    fd.append('cantidad_total', form.cantidad_total.value);

    // 3) Packs dinámicos: código + manual
    document.querySelectorAll('.pack-codigo-group').forEach(grupo => {
      const codigoInput = grupo.querySelector('input[name="pack_codigo"]');
      const manualInput = grupo.querySelector('input[name="pack_manual"]');

      // Solo si hay código
      if (codigoInput.value.trim()) {
        fd.append('pack_codigo', codigoInput.value.trim());
        if (manualInput.files.length) {
          fd.append('pack_manual', manualInput.files[0]);
        }
      }
    });

    // 4) Envío al servidor
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: fd
      });
      if (!res.ok) {
        const text = await res.text();
        return alert('❌ Error al crear el Kit: ' + text);
      }
      alert('✅ Kit creado correctamente');
      window.location.href = '/profesor/dashboard';
    } catch (err) {
      console.error('Error de red:', err);
      alert('❌ No se pudo contactar con el servidor.');
    }
  });
});
