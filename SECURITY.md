# Security policy

## Supported versions

logease is a young project. We provide security fixes for the latest minor
release line on `main`.

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |
| < 0.1   | ❌        |

## Reporting a vulnerability

**Please do not open public issues for security vulnerabilities.**

Instead, email the maintainer at `security@example.com` (TODO: replace with a
real contact) with:

- a description of the issue and its impact,
- the affected logease version,
- a minimal reproduction, and
- suggested fix if you have one.

We aim to acknowledge reports within 72 hours and to ship a fix for verified
issues within 30 days. Coordinated disclosure is appreciated.

## Security posture

- logease has **zero runtime dependencies**, so its dependency attack surface
  is limited to the Node.js standard library.
- logease **never throws** from a `log*` call. Transport write failures are
  swallowed. This means a logging statement will not crash your application —
  but it also means log loss is silent. If you depend on logs for security
  audit, combine logease with a reliable transport (file rotation, a remote
  sink) and monitor transport health.
- logease writes to the **file system** when a `FileTransport` is configured.
  Path traversal is the caller's responsibility: never pass untrusted user
  input as a `path`.

## Hardening tips

- In production, prefer `JsonFormatter` to stdout (or a file) over the pretty
  formatter — pretty output contains ANSI escapes that can confuse naive log
  parsers.
- Set `LOGEASE_LEVEL=warn` in production to reduce volume and surface only
  actionable output.
- Treat log lines as data: don't log secrets. logease does not redact fields
  for you (yet — see #roadmap).
