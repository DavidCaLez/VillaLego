async function cargarHistorias() {
    const res = await fetch('/historia-usuario');
    const historias = await res.json();
    const contenedor = document.getElementById('contenedor');

    historias.forEach(h => {
        const card = document.createElement('div');
        card.classList.add('card');
        
        card.innerHTML = `
        <h3>${h.id}</h3>
        <p>${h.descripcion}</p>
        <p><strong>Size:</strong> ${h.size ?? 'Sin definir'}</p>
        <p><strong>Prioridad:</strong> ${h.priority ?? 'Sin definir'}</p>
        <p><strong>Completado:</strong> ${h.completado ? '✅' : '❌'}</p>
        <p><strong>Validado PO:</strong> ${h.validadoPO ? '✅' : '❌'}</p>
        <p><strong>Validado Cliente:</strong> ${h.validadoCliente ? '✅' : '❌'}</p>
        <p><strong>¿Es Mejora?:</strong> ${h.esMejora ? '✅' : '❌'}</p>
        `;
        contenedor.appendChild(card);
    });
}

cargarHistorias();
