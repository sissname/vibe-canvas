import { spawn } from 'node:child_process';

const tests = [
  ['smoke', ['node', 'scripts/smoke-test.mjs']],
  ['provider contract', ['node', 'scripts/provider-contract-test.mjs']],
];

for (const [name, command] of tests) {
  await run(name, command);
}

function run(name, [bin, ...args]) {
  return new Promise((resolve, reject) => {
    const child = spawn(bin, args, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${name} failed with exit code ${code}`));
    });
  });
}
