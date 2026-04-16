import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { setTimeout as wait } from 'node:timers/promises';

const appPort = Number(process.env.PROVIDER_TEST_APP_PORT ?? 3101);
const providerPort = Number(process.env.PROVIDER_TEST_PROVIDER_PORT ?? 4101);
const baseUrl = `http://127.0.0.1:${appPort}`;
const providerUrl = `http://127.0.0.1:${providerPort}/generate`;

let app;
let provider;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

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

async function waitForApp() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/api/generate/health`);
      if (response.status < 500) return;
    } catch {
      // App is still starting.
    }

    await wait(500);
  }

  throw new Error(`Provider contract app did not become ready at ${baseUrl}`);
}

function startProvider() {
  return new Promise((resolve) => {
    const server = createServer(async (request, response) => {
      if (request.method !== 'POST' || request.url !== '/generate') {
        response.writeHead(404, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Not found' }));
        return;
      }

      const body = await readBody(request);
      const prompt = safeJson(body)?.prompt ?? '';

      if (prompt.includes('invalid')) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ project: { title: 'Incomplete project' } }));
        return;
      }

      if (prompt.includes('upstream-error')) {
        response.writeHead(429, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'OpenClaw quota exceeded' }));
        return;
      }

      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(createProject(prompt)));
    });

    server.listen(providerPort, '127.0.0.1', () => resolve(server));
  });
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      body += chunk;
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });
}

function createProject(prompt) {
  const previewHtml = '<main><h1>OpenClaw contract fixture</h1></main>';

  return {
    project: {
      id: 'project-contract-fixture',
      prompt,
      title: 'OpenClaw Contract Fixture',
      tagline: 'Validated provider response',
      description: 'A fixture project returned by the local provider contract test.',
      primaryAction: 'Start',
      secondaryAction: 'Learn more',
      sections: [
        { title: 'Fixture', description: 'Used to validate OpenClaw-compatible responses.' },
      ],
      files: [
        {
          name: 'landing-page.html',
          path: 'app/landing-page.html',
          language: 'html',
          content: previewHtml,
        },
      ],
      previewHtml,
      createdAt: new Date('2026-04-16T00:00:00.000Z').toISOString(),
    },
  };
}

function startApp() {
  app = spawn('npm', ['run', 'start'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      GENERATION_PROVIDER: 'openclaw',
      OPENCLAW_GENERATE_URL: providerUrl,
      PORT: String(appPort),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  app.stdout.on('data', (chunk) => process.stdout.write(chunk));
  app.stderr.on('data', (chunk) => process.stderr.write(chunk));
}

async function run() {
  provider = await startProvider();
  startApp();
  await waitForApp();

  const health = await request('/api/generate/health');
  assert(health.status === 200, `Expected OpenClaw health 200, got ${health.status}`);
  assert(health.body?.provider === 'openclaw', 'Expected OpenClaw provider in health response');
  assert(health.body?.configured === true, 'Expected OpenClaw provider to be configured');
  assert(health.body?.realExecution === true, 'Expected OpenClaw provider to be marked as real execution');

  const valid = await request('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'valid provider prompt' }),
  });
  assert(valid.status === 200, `Expected valid provider response 200, got ${valid.status}`);
  assert(valid.body?.project?.title === 'OpenClaw Contract Fixture', 'Expected fixture project title');

  const invalid = await request('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'invalid provider payload' }),
  });
  assert(invalid.status === 502, `Expected invalid provider payload 502, got ${invalid.status}`);

  const upstreamError = await request('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: 'upstream-error provider payload' }),
  });
  assert(upstreamError.status === 429, `Expected upstream provider error 429, got ${upstreamError.status}`);

  console.log('Provider contract tests passed');
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (app) {
      app.kill();
    }

    if (provider) {
      provider.close();
    }
  });
