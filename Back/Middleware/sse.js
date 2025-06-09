// Back/Middleware/sse.js
const clients = [];

/**
 * Middleware SSE:
 *  - Si la petición es GET /resultado/stream, abre la conexión SSE.
 *  - En cualquier otra petición, inyecta en app.locals la función sseBroadcast.
 */
function sseHandler(req, res, next) {
    if (req.method === 'GET' && req.path === '/resultado/stream') {
        res.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive'
        });
        res.flushHeaders();
        clients.push(res);

        req.on('close', () => {
            const idx = clients.indexOf(res);
            if (idx !== -1) clients.splice(idx, 1);
        });
        // No llamamos next(): esta ruta responde directamente
        return;
    }

    // Inyectamos broadcast para el resto de rutas
    req.app.locals.sseBroadcast = (event, data) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        clients.forEach(clientRes => clientRes.write(payload));
    };

    next();
}

module.exports = sseHandler;
