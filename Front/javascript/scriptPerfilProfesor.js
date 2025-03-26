document.addEventListener('DOMContentLoaded', () => {
    fetch('/profesor/perfil')
        .then(res => res.json())
        .then(data => {
        document.getElementById('nombreProfesor').textContent = data.nombre;
        document.getElementById('correoProfesor').textContent = data.correo;
        document.getElementById('avatarInicial').textContent = data.correo[0].toUpperCase();
    });
});