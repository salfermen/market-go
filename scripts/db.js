// Base de datos local de desarrollo: emulador de Cloud Firestore en 127.0.0.1:8085
// (configurado en firebase.json). Los datos se guardan en backend/.firestore-data al
// cerrar con Ctrl+C y se vuelven a cargar en el siguiente arranque.
//
// Uso: npm run db
const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const dataDir = 'backend/.firestore-data'; // relativo a la raíz (la ruta del proyecto puede tener espacios)

const args = ['--yes', 'firebase-tools', 'emulators:start', '--only', 'firestore', '--export-on-exit', dataDir];
if (fs.existsSync(path.join(root, dataDir, 'firebase-export-metadata.json'))) {
  args.push('--import', dataDir);
}

const child = spawn('npx', args, { cwd: root, stdio: 'inherit', shell: process.platform === 'win32' });

// Ctrl+C también llega al emulador; esperamos a que termine de exportar los datos antes de salir.
process.on('SIGINT', () => {});
child.on('exit', (code) => process.exit(code ?? 0));
