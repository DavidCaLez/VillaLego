const turnoId = window.location.pathname.split('/').pop();
document.addEventListener('DOMContentLoaded', async() => {
     try {
        const res = await fetch(`/alumno/api/rolTurno/${turnoId}`);
        const rol = await res.json();
        const contenedor = document.getElementById('container');
        const iframe = document.createElement('iframe');
        switch (rol) {
            case 'Scrum Master':
                
                iframe.src = '/pdfs/VillaLego_Guia_SM.pdf';
                iframe.style.width = '70%';
                iframe.style.height = '80vh';
                iframe.style.border = 'none';
                contenedor.appendChild(iframe);
                break;
            case 'Product Owner':
                iframe.src = '/pdfs/VillaLego_Guia_PO.pdf';
                iframe.style.width = '70%';
                iframe.style.height = '80vh';
                iframe.style.border = 'none';
                contenedor.appendChild(iframe);
                break;
            case 'Desarrollador':
                iframe.src = '/pdfs/VillaLego_Guia_Desarrolladores.pdf';
                iframe.style.width = '70%';
                iframe.style.height = '80vh';
                iframe.style.border = 'none';
                contenedor.appendChild(iframe);
                break;
        }

    }catch (err) {
        console.error('Error al obtener el rol', err);
    }
});