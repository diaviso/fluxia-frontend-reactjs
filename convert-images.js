// Script Node.js pour convertir les images en base64
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemins des images (ajustez si nécessaire)
const images = [
  { name: 'sn.png', path: './dist/assets/sn.png' },
  { name: 'crousz.png', path: './dist/assets/crousz.png' }
];

let output = '// Images en base64 pour les PDFs\n\nexport const IMAGES = {\n';

images.forEach(img => {
  try {
    const imagePath = path.join(__dirname, img.path);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    const ext = path.extname(img.name).substring(1);
    const dataUrl = `data:image/${ext};base64,${base64}`;
    
    const varName = img.name.replace(/[.-]/g, '_').toUpperCase().replace('_PNG', '');
    output += `  ${varName}: '${dataUrl}',\n`;
  } catch (error) {
    console.error(`Erreur pour ${img.name}:`, error.message);
  }
});

output += '};\n';

// Écrire le fichier sans BOM
const outputPath = path.join(__dirname, 'src/utils/imageToBase64.ts');
fs.writeFileSync(outputPath, output, { encoding: 'utf8' });
console.log(`Fichier créé: ${outputPath}`);
