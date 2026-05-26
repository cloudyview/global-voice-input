import { RecordingPayload, Settings, StatusMessage } from "./types";

declare global {
  interface Window {
    voiceInput: {
      getSettings: () => Promise<Settings>;
      saveSettings: (settings: Settings) => Promise<Settings>;
      startRecording: (handler: () => void) => void;
      stopRecording: (handler: () => void) => void;
      recordingComplete: (payload: RecordingPayload) => void;
      recordingError: (message: string) => void;
      statusChanged: (handler: (_event: unknown, status: StatusMessage) => void) => void;
    };
  }
}

export {};
