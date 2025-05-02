// scriptCrearKit.js
document.addEventListener('DOMContentLoaded', () => {
    const btnAgregar = document.getElementById('btnAgregarCodigo');
    const contenedor = document.getElementById('codigos-container');

    btnAgregar.addEventListener('click', () => {
        const grupo = document.createElement('div');
        grupo.classList.add('pack-codigo-group');
        grupo.innerHTML = `
        <label>Código del pack:</label><br>
        <input type="text" name="pack_codigo" required>
        <button type="button" class="btnEliminarCodigo">Eliminar</button>
        <br>
      `;
        contenedor.appendChild(grupo);

        // handler para el botón de eliminar ese código
        grupo.querySelector('.btnEliminarCodigo')
            .addEventListener('click', () => contenedor.removeChild(grupo));
    });
});
