function mostrarMensaje(tipo, texto, segundos = 4) {
    const alerta = document.getElementById('alerta');
    if (!alerta) return;
    
    alerta.className = `alerta ${tipo}`;
    alerta.textContent = texto;
    alerta.style.display = 'block';
    
    setTimeout(() => {
        alerta.style.display = 'none';
    }, segundos * 1000);
    }
    
    document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const mensaje = params.get('mensaje');
    const tipo = params.get('tipo');
    
    if (mensaje && tipo) {
        mostrarMensaje(tipo, decodeURIComponent(mensaje));
        
        const url = new URL(window.location);
        url.searchParams.delete('mensaje');
        url.searchParams.delete('tipo');
        window.history.replaceState({}, document.title, url.toString());
    }
});
