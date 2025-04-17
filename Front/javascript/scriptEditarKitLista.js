// scriptEditarKit.js
window.addEventListener('DOMContentLoaded', () => {
    const kitId = window.location.pathname.split('/').pop();
    document.getElementById('kitId').value = kitId;

    fetch(`/kit/editarKit/${kitId}`)
        .then(res => res.json())
        .then(data => {
            document.getElementById('nombreKit').value = data.nombre;
            document.getElementById('descripcionKit').value = data.descripcion;
            document.getElementById('linkPDF').href = `/kit/pdf/${kitId}`;

            if (data.packs && data.packs.length > 0) {
                const pack = data.packs[0];
                document.getElementById('nombrePack').value = pack.nombre;
                document.getElementById('descripcionPack').value = pack.descripcion;
                document.getElementById('cantidadPack').value = pack.cantidad_total;
            }
        })
        .catch(err => {
            console.error('Error al cargar el kit:', err);
            alert('No se pudo cargar la información del kit');
        });

    document.getElementById('formEditarKit').addEventListener('submit', e => {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        fetch(`/kit/editarKit/${kitId}`, {
            method: 'POST',
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    alert('❌ ' + data.error);
                } else {
                    alert('✅ Kit actualizado correctamente');
                    window.location.href = '/profesor/dashboard';
                }
            })
            .catch(err => {
                console.error('Error al guardar:', err);
                alert('Error al guardar los cambios');
            });
    });
});
