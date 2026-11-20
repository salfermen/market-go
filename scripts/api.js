// Inicia el backend Ktor (carpeta backend/) con el wrapper de Gradle del sistema operativo.
// Sin llave de Firebase, el backend usa automáticamente la base local de `npm run db`.
//
// Uso: npm run api
const { spawn } = require('node:child_process');
const path = require('node:path');

const isWindows = process.platform === 'win32';
const child = spawn(isWindows ? 'gradlew.bat' : './gradlew', ['run'], {
  cwd: path.join(__dirname, '..', 'backend'),
  stdio: 'inherit',
  shell: isWindows,
});

process.on('SIGINT', () => {});
child.on('exit', (code) => process.exit(code ?? 0));
