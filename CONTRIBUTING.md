# Contributing

Thanks for helping improve VibeCanvas.

## Project Status

VibeCanvas is currently an Alpha project. The default generator is a local mock provider, and the OpenClaw provider boundary is still evolving.

## Development Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Before Opening A Pull Request

Please run:

```bash
npm run lint
npm run build
npm test
```

If you change dependencies, also run:

```bash
npm audit --audit-level=moderate
```

## Contribution Guidelines

- Keep the prompt-first flow simple for new users.
- Clearly label experimental workflow/canvas behavior.
- Do not commit secrets, local `.env` files, generated build output, or `node_modules`.
- Prefer small pull requests with a focused scope.
- Include screenshots or short recordings for UI changes.
- Add or update smoke tests when changing API behavior.

## Commit Style

Use short imperative commit messages, for example:

```text
Add OpenClaw provider error handling
Fix mobile project workspace overflow
Document mock generation mode
```

## Reporting Bugs

Use the bug report issue template and include:

- Environment and browser
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots or console output when relevant
