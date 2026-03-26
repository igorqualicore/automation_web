const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const reportsDir = path.join(__dirname, '..', 'cypress', 'reports', 'logs');
const logPath = path.join(reportsDir, 'terminal.log');

fs.mkdirSync(reportsDir, { recursive: true });

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const args = ['cypress', 'run', '--browser', 'chrome', ...process.argv.slice(2)];
const child = spawn(command, args, {
  cwd: path.join(__dirname, '..'),
  env: process.env,
  shell: process.platform === 'win32',
});

const logStream = fs.createWriteStream(logPath, { flags: 'w' });

function writeChunk(target, chunk) {
  target.write(chunk);
  logStream.write(chunk);
}

child.stdout.on('data', (chunk) => writeChunk(process.stdout, chunk));
child.stderr.on('data', (chunk) => writeChunk(process.stderr, chunk));

child.on('close', (code) => {
  logStream.end(() => {
    process.exit(code || 0);
  });
});

child.on('error', (error) => {
  const message = `${error.stack || error.message}\n`;

  process.stderr.write(message);
  logStream.write(message);
  logStream.end(() => {
    process.exit(1);
  });
});