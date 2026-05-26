import { Settings } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  mode: "toggle",
  voiceShortcut: "F8",
  enterShortcut: "F9",
  language: "zh",
  model: "gpt-4o-mini-transcribe",
  transcriptionBaseUrl: "https://api.openai.com/v1",
  apiKeyEnvName: "OPENAI_API_KEY",
  envFilePath: "",
  apiKey: "",
  autoEnterAfterPaste: false,
  restoreClipboard: true
};
