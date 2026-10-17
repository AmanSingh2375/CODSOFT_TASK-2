import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const ignoreList = [
  'node_modules',
  'dist',
  '.git',
  '.DS_Store',
  'dinedesk-restaurant-platform.zip',
];

async function buildZip() {
  const zip = new JSZip();

  function addDirectory(currentDir, zipFolder) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      if (ignoreList.includes(file) || file.endsWith('.log')) continue;
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        const subFolder = zipFolder.folder(file);
        if (subFolder) addDirectory(fullPath, subFolder);
      } else {
        const content = fs.readFileSync(fullPath);
        zipFolder.file(file, content);
      }
    }
  }

  console.log('Packaging DineDesk project files...');
  addDirectory(rootDir, zip);

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const outPath = path.join(rootDir, 'dinedesk-restaurant-platform.zip');
  fs.writeFileSync(outPath, buffer);
  console.log(`Successfully generated: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`);
}

buildZip().catch((err) => {
  console.error('Build zip failed:', err);
  process.exit(1);
});
