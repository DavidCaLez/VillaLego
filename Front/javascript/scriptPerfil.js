document.addEventListener('DOMContentLoaded', () => {
    fetch('/perfil')
        .then(res => res.json())
        .then(data => {
        document.getElementById('nombre').textContent = data.nombre;
        document.getElementById('correo').textContent = data.correo;
        document.getElementById('avatarInicial').textContent = data.correo[0].toUpperCase();
    });
});