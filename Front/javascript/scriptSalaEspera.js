// Function to check turn phase from server
const params = window.location.pathname.split('/');
const turnoId = params.pop();
async function checkTurnPhase() {
    try {
        const response = await fetch(`/turno/fase/${turnoId}`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Current phase:', data.fase);
        switch (data.fase) {
            case 'Lectura instrucciones':
                // Redirect to instructions page
                window.location.href = '/turno/instrucciones/' + turnoId;
                break;
            case 'Priorizacion de la pila del producto':
                // Redirect to the prioritization page
                window.location.href = '/turno/priorizacion/' + turnoId;
                break;
            case 'Planificacion del sprint':
                // Redirect to the sprint planning page
                window.location.href = '/turno/planificacion/' + turnoId;
                break;
            case 'Ejecucion del sprint':
                // Redirect to Sprint.html
                window.location.href = '/turno/sprint/' + turnoId;
                break;
            case 'Revision del sprint':
                // Redirect to the sprint review page
                break;
            case 'Retrospectiva del sprint':
                // Redirect to the sprint retrospective page
                window.location.href = `/turno/retrospectiva/vista/${turnoId}`;
                break;
            default:
                break;
        }

    } catch (error) {
        console.error('Error checking turn phase:', error);
    }
}


const intervalId = setInterval(checkTurnPhase, 2000);


window.addEventListener('unload', () => {
    clearInterval(intervalId);
});