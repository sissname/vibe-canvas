# VibeCanvas

VibeCanvas is an experimental **Idea to App Studio**. Describe a product idea in one sentence, generate a first usable draft, then inspect the preview, files, and structure before moving into advanced editing.

> Status: Alpha. The default generator is a local mock provider. Real generation requires an OpenClaw-compatible endpoint.

## Why

Vibe coding lowers the barrier to creating software, but many tools still expose too much complexity up front. VibeCanvas starts with a simple prompt-first flow:

1. Describe the product or page you want.
2. Generate a draft with preview content and project files.
3. Review the generated structure.
4. Continue into advanced workflow/canvas editing when needed.

## Current Capabilities

- Prompt-first homepage for generating an app/page draft.
- Generated project workspace with Preview, Files, and Structure tabs.
- Local mock generator for demo and development.
- Optional OpenClaw provider hook via environment variables.
- Local persistence for the latest generated project and files.
- Smoke test that validates homepage rendering and key API paths.

## Screenshot

Add a screenshot or GIF here after publishing the repository:

```md
![VibeCanvas prompt-first app studio](./docs/screenshot.png)
```

## Known Limitations

- The default `GENERATION_PROVIDER=mock` does not call a real LLM.
- Cloud persistence, authentication, user accounts, and rate limiting are not implemented.
- Advanced canvas/workflow features are experimental.
- Generated preview currently uses Blob HTML, not a hardened sandbox.
- Browser-level E2E and visual regression tests are still needed.

## Quick Start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

```bash
# mock: local demo generator
# openclaw: call OPENCLAW_GENERATE_URL
GENERATION_PROVIDER=mock

# Required only when GENERATION_PROVIDER=openclaw
OPENCLAW_GENERATE_URL=
OPENCLAW_API_TOKEN=
```

## Scripts

```bash
npm run dev      # Start the dev server
npm run build    # Build for production
npm run start    # Start the production server
npm run lint     # Run ESLint
npm test         # Run production smoke tests
```

## OpenClaw Provider Contract

When `GENERATION_PROVIDER=openclaw`, `OPENCLAW_GENERATE_URL` should accept:

```json
{
  "prompt": "Build a SaaS dashboard homepage"
}
```

And return:

```json
{
  "project": {
    "id": "project-id",
    "prompt": "original prompt",
    "title": "Project title",
    "tagline": "Main value proposition",
    "description": "Short description",
    "primaryAction": "Start",
    "secondaryAction": "Learn more",
    "sections": [
      { "title": "Section", "description": "Section description" }
    ],
    "files": [
      {
        "name": "landing-page.html",
        "path": "app/landing-page.html",
        "language": "html",
        "content": "<main>...</main>"
      }
    ],
    "previewHtml": "<main>...</main>",
    "createdAt": "2026-04-16T00:00:00.000Z"
  }
}
```

## Project Structure

```text
app/
  api/generate/route.ts      # Generation API
  page.tsx                   # Prompt-first app studio UI
  layout.tsx                 # Root layout
  globals.css                # Design tokens and global styles
components/                  # Experimental canvas/layout/preview components
lib/
  generation-service.ts      # Mock/OpenClaw provider boundary
  mock-generation.ts         # Local demo generator
stores/                      # Zustand stores
types/                       # Shared TypeScript types
scripts/smoke-test.mjs       # Production smoke test
```

## Validation Before Publishing

```bash
npm run lint
npm run build
npm test
npm audit --audit-level=moderate
```

## Security Notes

This project contains experimental workflow/canvas code paths. Do not execute untrusted generated code in production without a real sandbox, review, and runtime isolation. See [SECURITY.md](./SECURITY.md).

## Roadmap

See [ROADMAP.md](./ROADMAP.md).

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

MIT. See [LICENSE](./LICENSE).
