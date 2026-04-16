# Changelog

All notable changes to VibeCanvas will be documented in this file.

The format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses semantic versioning once stable releases begin.

## Unreleased

### Added

- Prompt-first app studio homepage.
- Generated project workspace with Preview, Files, and Structure tabs.
- Mock generation provider for local demos.
- OpenClaw provider boundary through `GENERATION_PROVIDER=openclaw`.
- Local persistence for generated project and file state.
- Production smoke test script.
- Open-source project files, including License, Contributing, Security, Code of Conduct, GitHub issue templates, PR template, and CI.
- App-level Error Boundary with a user-facing recovery screen.
- Sandboxed iframe preview MVP with a restrictive preview CSP.

### Changed

- Removed build-time dependency on Google Fonts to make production builds reproducible in restricted network environments.
- Reframed documentation around Alpha status and known limitations.

### Fixed

- Invalid JSON requests to `/api/generate` now return `400` instead of `500`.
- `.env.example` is allowed through `.gitignore` while local `.env` files remain ignored.
- Smoke tests now cover long prompt rejection and script-free mock preview output.
