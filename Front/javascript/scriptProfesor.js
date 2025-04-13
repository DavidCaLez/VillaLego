//TODO: Terminar esta parte
fetch('/usuario/inicial')
.then(res => res.json())
.then(data => {
    document.querySelector('.avatar').textContent = data.inicial.toUpperCase();
});

function toggleMenu() {
document.getElementById('menu-desplegable').classList.toggle('show');
}
// Aqui se obtienen las actividades del profesor y se muestran en la lista
fetch('/actividad/lista')
.then(res => res.json())
.then(data => {
const contenedor = document.getElementById('listaActividades');
data.forEach(act => {
    contenedor.innerHTML += `
    <div class="actividad">
        <div>
        <strong>${act.nombre}</strong> (ID: ${act.id})<br>
        </div>
        <div class="botones">
        <button class="editar" onclick="location.href='/actividad/editar/${act.id}'">Editar</button>
        <button class="ver" onclick="location.href='/profesor/${act.id}'">Ver</button>
        </div>
    </div>
    `;
});
});