# Roadmap

VibeCanvas is currently an Alpha project. This roadmap focuses on turning the prompt-first prototype into a useful open-source app studio.

## Alpha

- [x] Prompt-first homepage
- [x] Generated project workspace
- [x] Mock generation provider
- [x] OpenClaw provider boundary
- [x] Local persistence for generated project state
- [x] Smoke tests for homepage and generation API
- [x] Open-source project hygiene
- [x] App-level Error Boundary
- [x] Sandboxed iframe preview MVP

## Beta

- [ ] Real OpenClaw generation adapter with schema validation
- [ ] Project save/load with a backend persistence layer
- [ ] Hardened preview sandbox with stronger isolation and interaction controls
- [ ] Browser E2E tests for prompt, generation, tabs, and preview
- [ ] Visual regression snapshots for desktop and mobile
- [ ] Error monitoring and structured logging
- [ ] Better file editor integration for generated files

## 1.0

- [ ] Authentication and user-owned projects
- [ ] Rate limiting and abuse protection
- [ ] Version history for generated projects
- [ ] Export and deployment workflow
- [ ] Stable advanced canvas/workflow mode
- [ ] Public plugin/provider documentation

## Open Questions

- Should OpenClaw be the only real provider, or should providers be pluggable?
- Should generated previews run in an iframe sandbox, WebContainer, or a server-side preview worker?
- Should the advanced canvas be part of the default UI or remain behind an advanced mode?
