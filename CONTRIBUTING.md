# Contributing

Thanks for considering a contribution to Global Voice Input.

This project is intentionally small: a Windows tray app, global hotkeys, microphone recording, transcription, and paste into the active app. Changes that keep that loop reliable are especially welcome.

## Development Setup

```powershell
npm ci
npm run typecheck
npm run build
npm run start
```

## Pull Request Checklist

- Keep changes focused and reviewable.
- Run `npm run typecheck`.
- Run `npm run build`.
- Update README or docs when behavior changes.
- Avoid committing API keys, recordings, logs, build output, or local settings.
- Explain user-visible behavior and verification in the PR description.

## Good First Areas

- Improve settings validation.
- Improve tray status messages.
- Add provider abstraction for non-OpenAI ASR.
- Add local ASR support through whisper.cpp.
- Improve clipboard preservation.
- Add tests around pure utility functions.

## Design Principles

- Prefer boring, dependable Windows behavior over clever abstractions.
- Keep the app usable from the tray without requiring a full window.
- Treat recording, clipboard, and API keys as sensitive surfaces.
- Do not add native dependencies unless the reliability gain is clear.

## Commit Style

This repository uses decision-oriented commit messages. Prefer an intent line that explains why the change exists, then include useful trailers when they add context:

```text
Improve hotkey validation before registering shortcuts

Reject invalid accelerator strings before they reach Electron so users get
actionable feedback in settings instead of silent shortcut failure.

Confidence: high
Scope-risk: narrow
Tested: npm run typecheck; npm run build
```
