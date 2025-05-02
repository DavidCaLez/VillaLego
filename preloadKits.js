const fs = require('fs');
const path = require('path');
const sequelize = require('./Back/config/Config_bd.env');

const Kit = require('./Back/Model/KitModel');
const PackLego = require('./Back/Model/PackLegoModel');

async function precargarKitsYpacks() {
  await sequelize.sync(); // Asegura conexión y estructura

    const kits = [
    {
        nombre: 'Kit Edificios',
        descripcion: 'Kit con enfoque en viviendas, fortalezas y edificios de protección',
        archivoPath: path.join(__dirname, 'pdfs/VillaLego_Cliente_Edificios.pdf')
    },
    {
        nombre: 'Kit Vehículos',
        descripcion: 'Kit orientado al transporte y movilidad urbana en VillaLego',
        archivoPath: path.join(__dirname, 'pdfs/VillaLego_Cliente_Vehiculos.pdf')
    },
    {
        nombre: 'Kit Zoo Mágico',
        descripcion: 'Kit especializado en criaturas fantásticas y mágicas',
        archivoPath: path.join(__dirname, 'pdfs/VillaLego_Cliente_ZooMagico.pdf')
    },
    {
        nombre: 'Kit Zoo Normal',
        descripcion: 'Kit para zoológicos tradicionales con animales comunes',
        archivoPath: path.join(__dirname, 'pdfs/VillaLego_Cliente_ZooNormal.pdf')
    }
    ];

    for (const kit of kits) {
    const archivo_pdf = fs.readFileSync(kit.archivoPath);

    const nuevoKit = await Kit.create({
        nombre: kit.nombre,
        descripcion: kit.descripcion,
        archivo_pdf
    });

    await PackLego.create({
        codigo: "1111", // Mismo nombre que el kit
        descripcion: `Pack asociado a ${kit.nombre}`,
        cantidad_total: 10, // Valor inicial, puedes ajustar
        kit_id: nuevoKit.id
    });

    console.log(`✅ Insertado Kit y Pack: ${kit.nombre}`);
        }

    console.log("✅ Precarga completa de Kits y Packs de LEGO");
    process.exit();
}

precargarKitsYpacks();
