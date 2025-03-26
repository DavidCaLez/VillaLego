document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('busquedaAlumno');
    input.addEventListener('input', () => {
        const texto = input.value.toLowerCase();
        const tarjetas = document.querySelectorAll('.alumno-card');
        
        tarjetas.forEach(card => {
        const contenido = card.innerText.toLowerCase();
        if (contenido.includes(texto)) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
        });
    });
});