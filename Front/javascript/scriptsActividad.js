function validarGrupos() {
    const min = parseInt(document.getElementById('tamaño_min').value);
    const max = parseInt(document.getElementById('tamaño_max').value);

    if (min >= max) {
        abrirPopup();
        return false;
    }

    return true;
}

function abrirPopup() {
    document.getElementById("popup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

function cerrarPopup() {
    document.getElementById("popup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

document.querySelector('.crear-form').addEventListener('submit', function(e) {
    if (!validarGrupos()) {
        e.preventDefault();
    }
});