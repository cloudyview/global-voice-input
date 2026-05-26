# Security Policy

## Supported Versions

Global Voice Input is currently in early alpha. Security fixes target the latest commit on `main` until tagged releases begin.

## Sensitive Surfaces

This app interacts with several sensitive areas:

- Microphone recording.
- Cloud transcription.
- OpenAI API keys.
- System clipboard.
- Simulated keyboard input.
- Global shortcuts.

Please treat reports in these areas as security relevant, even when the bug looks small.

## Reporting a Vulnerability

Please do not open a public issue for vulnerabilities involving credential exposure, unintended recording, clipboard leakage, or remote code execution.

Instead, contact the maintainer through GitHub and include:

- A short description of the issue.
- Steps to reproduce.
- Impact.
- Suggested fix, if known.

## Current Security Notes

- API keys stored through the settings UI are saved locally in plain text.
- Using an environment variable or env file is preferred for users who do not want the key in the settings file.
- Env-file values are read at transcription time and are not copied back into settings.
- Recognized text is temporarily written to the clipboard.
- Clipboard restoration is best effort and currently handles text clipboard content only.
- The app does not record unless the configured voice shortcut is triggered.
