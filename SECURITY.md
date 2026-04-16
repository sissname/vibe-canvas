# Security Policy

## Supported Versions

VibeCanvas is currently Alpha software. Security fixes target the latest `main` branch.

## Reporting A Vulnerability

Please do not open a public issue for sensitive security reports.

If this repository is published under an organization, use GitHub Security Advisories when available. Otherwise, contact the maintainers privately through the repository owner profile.

Please include:

- Affected version or commit
- Reproduction steps
- Impact assessment
- Suggested mitigation, if known

## Experimental Code Execution

Some advanced workflow/canvas paths include experimental code execution helpers. These are intended for local development and prototyping only.

Do not use untrusted generated code in production without:

- A hardened sandbox
- Runtime isolation
- Network and filesystem restrictions
- Audit logging
- Clear user consent

## Secrets

Never commit `.env.local`, API keys, OpenClaw tokens, generated secrets, or private credentials. Use `.env.example` for documentation only.
