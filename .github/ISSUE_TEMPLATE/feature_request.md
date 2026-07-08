---
name: Feature request
about: Suggest an idea for logease
title: "[feature] "
labels: enhancement, needs-triage
---

## Is your feature request related to a problem?

A clear description of the problem. e.g. "I'm always frustrated when [...]"

## Proposed solution

What you'd like logease to do, with an example if possible:

```ts
import { log } from 'logease';
// I wish I could...
```

## Alternatives considered

Other ways you've considered solving this, and why they fall short.

## Scope / non-goals

Keep logease tiny & zero-dep. New features should:
- not add runtime dependencies,
- not bloat the hot path,
- be optional (behind a transport, formatter, or option) when reasonable.

## Anything else?

Links, prior art (pino, winston, consola, debug, ...).
