function mostrarMensaje(tipo, texto, segundos = 4) {
    const alerta = document.getElementById('alerta');
    const mensajeSpan = document.getElementById('mensajeAlerta');
    const btnCerrar = document.getElementById('cerrarAlerta');

    if (!alerta || !mensajeSpan || !btnCerrar) return;

    alerta.className = `alerta ${tipo}`;
    mensajeSpan.textContent = texto;
    alerta.style.display = 'block';

    const timeoutId = setTimeout(() => {
        alerta.style.display = 'none';
    }, segundos * 1000);

    btnCerrar.onclick = () => {
        clearTimeout(timeoutId);
        alerta.style.display = 'none';
    };
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
