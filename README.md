# Global Voice Input

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Built with Electron](https://img.shields.io/badge/Electron-32-47848f.svg)](https://www.electronjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Platform](https://img.shields.io/badge/platform-Windows-0078d4.svg)](#requirements)

Desktop-wide push-to-talk voice input for Windows.

Global Voice Input is a small tray utility that lets you dictate into whichever app currently has focus. Press a global hotkey to record, release or press again to transcribe, and the recognized text is pasted into the active window.

> Status: early alpha. The core loop works, but packaging, installer signing, local ASR, and broader app compatibility are still on the roadmap.

## Highlights

- Desktop-wide hotkeys, not browser-only shortcuts.
- Two recording modes:
  - Toggle: press once to start recording, press again to stop and transcribe.
  - Hold: hold the voice key to record, release to stop and transcribe.
- Separate confirm key for sending Enter to the active app.
- Tray-first workflow with a settings window.
- OpenAI Audio Transcriptions API integration.
- Clipboard paste strategy for broad compatibility across desktop apps.
- TypeScript-first codebase with a small Electron surface area.

## Requirements

- Windows 10 or Windows 11.
- Node.js 20 or newer.
- A microphone.
- An OpenAI API key for cloud transcription.

## Quick Start

```powershell
git clone https://github.com/cloudyview/global-voice-input.git
cd global-voice-input
npm ci
npm run start
```

On first launch, open the tray menu, choose **Settings**, and enter your OpenAI API key.

You can also provide the key through an environment variable:

```powershell
$env:OPENAI_API_KEY="<YOUR_OPENAI_API_KEY>"
npm run start
```

## Default Controls

| Action | Default |
| --- | --- |
| Start/stop voice input | `F8` |
| Confirm / send Enter | `F9` |
| Recording mode | Toggle |
| Transcription model | `gpt-4o-mini-transcribe` |
| Language | `zh` |

## How It Works

```mermaid
flowchart LR
  A["Global hotkey"] --> B["Hidden Electron recorder"]
  B --> C["MediaRecorder audio blob"]
  C --> D["OpenAI transcription API"]
  D --> E["Clipboard write"]
  E --> F["Simulated Ctrl+V"]
  F --> G["Active desktop app"]
```

The app keeps a hidden recorder window alive so Chromium can access `MediaRecorder`. The main process owns global shortcuts, sends start/stop messages to the recorder, uploads the captured audio for transcription, writes the returned text to the clipboard, and simulates paste into the currently active application.

## Configuration

Open **Settings** from the tray menu to configure:

- Recording mode.
- Voice shortcut.
- Confirm shortcut.
- Transcription language.
- OpenAI transcription model.
- API key.
- Whether to automatically press Enter after pasting.
- Whether to restore the previous clipboard text after paste.

Settings are stored locally in Electron's `userData` directory.

## Privacy and Security

Global Voice Input records only when you trigger the configured voice hotkey. Audio is sent to the configured transcription provider. The current implementation uses OpenAI's Audio Transcriptions API.

Important notes:

- API keys are stored locally in plain text settings unless you use `OPENAI_API_KEY`.
- Recognized text is temporarily written to the system clipboard so it can be pasted into the active app.
- Clipboard restoration is best effort and currently restores text clipboard content only.
- Do not dictate secrets unless you are comfortable with your transcription provider and local clipboard behavior.

See [SECURITY.md](SECURITY.md) for vulnerability reporting and security expectations.

## Development

```powershell
npm ci
npm run typecheck
npm run build
npm run start
```

Project layout:

```text
src/main.ts            Electron main process, tray, shortcuts, orchestration
src/recorder.ts        Hidden renderer process for microphone recording
src/transcription.ts   OpenAI transcription client
src/windows-input.ts   Clipboard and Windows SendKeys integration
src/settings.ts        Settings window renderer code
src/settings-store.ts  Local settings persistence
```

## Roadmap

- Package a signed Windows installer.
- Add local ASR via whisper.cpp.
- Add provider abstraction for additional transcription backends.
- Improve hotkey capture and validation in the settings UI.
- Add a visible recording overlay.
- Add integration tests around clipboard and shortcut behavior.
- Preserve richer clipboard formats when restoring clipboard contents.

## Known Limitations

- Windows only.
- Transcription is record-then-transcribe, not streaming.
- Paste depends on the active app accepting `Ctrl+V`.
- Some elevated/admin apps may ignore input from a non-elevated process.
- Hold mode works best with single keys such as `F8`, `F9`, `Space`, or `Enter`.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## License

MIT License. See [LICENSE](LICENSE).
