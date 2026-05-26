import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import { DEFAULT_SETTINGS } from "./defaults";
import { Settings } from "./types";

const SETTINGS_FILE = "settings.json";

export function getSettingsPath(): string {
  return path.join(app.getPath("userData"), SETTINGS_FILE);
}

export function loadSettings(): Settings {
  const settingsPath = getSettingsPath();

  try {
    const raw = fs.readFileSync(settingsPath, "utf8");
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return normalizeSettings(parsed);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings: Settings): void {
  const settingsPath = getSettingsPath();
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, `${JSON.stringify(normalizeSettings(settings), null, 2)}\n`);
}

export function normalizeSettings(settings: Partial<Settings>): Settings {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    mode: settings.mode === "hold" ? "hold" : "toggle",
    voiceShortcut: settings.voiceShortcut?.trim() || DEFAULT_SETTINGS.voiceShortcut,
    enterShortcut: settings.enterShortcut?.trim() || DEFAULT_SETTINGS.enterShortcut,
    language: settings.language?.trim() || DEFAULT_SETTINGS.language,
    model: settings.model?.trim() || DEFAULT_SETTINGS.model,
    apiKey: settings.apiKey?.trim() || process.env.OPENAI_API_KEY || "",
    autoEnterAfterPaste: Boolean(settings.autoEnterAfterPaste),
    restoreClipboard: settings.restoreClipboard !== false
  };
}
