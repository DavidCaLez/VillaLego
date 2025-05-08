// Front/js/scriptHistoriaUsuario.js
document.addEventListener('DOMContentLoaded', () => {
    const kitSelect = document.getElementById('kit');

    fetch('/kit/api/kits')
        .then(res => {
            if (!res.ok) throw new Error('Error al cargar los kits');
            return res.json();
        })
        .then(kits => {
            kits.forEach(k => {
                const opt = document.createElement('option');
                opt.value = k.id;
                opt.textContent = k.nombre || k.titulo || `Kit ${k.id}`;
                kitSelect.appendChild(opt);
            });
        })
        .catch(err => {
            console.error(err);
            const warning = document.createElement('p');
            warning.className = 'error';
            warning.textContent = 'No se pudieron cargar los kits. Inténtalo más tarde.';
            kitSelect.parentElement.appendChild(warning);
        });
});
