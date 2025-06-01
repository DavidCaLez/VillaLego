

const os = require('os');
const QRCode = require('qrcode');

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const iface of Object.values(interfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                return config.address;
            }
        }
    }
    return 'localhost';
}

const ip = getLocalIP();
const url = `http://${ip}:3000/resultado/formulario-subida`;

QRCode.toFile('./qr_resultado.png', url, (err) => {
    if (err) throw err;
    console.log(`✅ QR generado: ${url}`);
});