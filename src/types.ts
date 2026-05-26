export type RecordingMode = "toggle" | "hold";
export type AppState = "idle" | "recording" | "transcribing" | "error";

export interface Settings {
  mode: RecordingMode;
  voiceShortcut: string;
  enterShortcut: string;
  language: string;
  model: string;
  transcriptionBaseUrl: string;
  apiKeyEnvName: string;
  envFilePath: string;
  apiKey: string;
  autoEnterAfterPaste: boolean;
  restoreClipboard: boolean;
}

export interface StatusMessage {
  state: AppState;
  message: string;
}

export interface RecordingPayload {
  arrayBuffer: ArrayBuffer;
  mimeType: string;
}
