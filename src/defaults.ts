import { Settings } from "./types";

export const DEFAULT_SETTINGS: Settings = {
  mode: "toggle",
  voiceShortcut: "F8",
  enterShortcut: "F9",
  language: "zh",
  model: "gpt-4o-mini-transcribe",
  apiKey: "",
  autoEnterAfterPaste: false,
  restoreClipboard: true
};
