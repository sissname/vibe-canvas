import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const port = Number(process.env.SMOKE_PORT ?? 3100);
const baseUrl = process.env.SMOKE_BASE_URL ?? `http://localhost:${port}`;
const shouldStartServer = !process.env.SMOKE_BASE_URL;

let server;

async function request(path, options) {
  const response = await fetch(`${baseUrl}${path}`, options);
  const text = await response.text();

  return {
    body: text ? safeJson(text) : null,
    status: response.status,
    text,
  };
}

function safeJson(value) {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function waitForServer() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }

    await wait(500);
  }

  throw new Error(`Server did not become ready at ${baseUrl}`);
}

async function run() {
  if (shouldStartServer) {
    server = spawn('npm', ['run', 'start'], {
      cwd: process.cwd(),
      env: { ...process.env, PORT: String(port) },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    server.stdout.on('data', (chunk) => process.stdout.write(chunk));
    server.stderr.on('data', (chunk) => process.stderr.write(chunk));

    await waitForServer();
  }

  const home = await request('/');
  assert(home.status === 200, `Expected homepage 200, got ${home.status}`);
  assert(
    typeof home.text === 'string' && home.text.includes('VibeCanvas'),
    'Expected homepage to render VibeCanvas'
  );

  const generationHealth = await request('/api/generate/health');
  assert(
    generationHealth.status === 200,
    `Expected generation health 200, got ${generationHealth.status}`
  );
  assert(
    generationHealth.body?.configured === true,
    'Expected default generation provider to be configured'
  );

  const generated = await request('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '做一个 SaaS Dashboard 首页' }),
  });
  assert(generated.status === 200, `Expected generate 200, got ${generated.status}`);
  assert(generated.body?.project?.title, 'Expected generated project title');
  assert(Array.isArray(generated.body?.project?.files), 'Expected generated project files');
  assert(
    generated.body?.project?.previewHtml?.includes('<script') === false,
    'Expected generated preview HTML to avoid inline scripts'
  );

  const emptyPrompt = await request('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert(emptyPrompt.status === 400, `Expected empty prompt 400, got ${emptyPrompt.status}`);

  const invalidJson = await request('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: 'not-json',
  });
  assert(invalidJson.status === 400, `Expected invalid JSON 400, got ${invalidJson.status}`);

  const longPrompt = await request('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'x'.repeat(2001) }),
  });
  assert(longPrompt.status === 400, `Expected long prompt 400, got ${longPrompt.status}`);

  console.log('Smoke tests passed');
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (server) {
      server.kill();
    }
  });
