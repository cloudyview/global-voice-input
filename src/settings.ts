import { DEFAULT_SETTINGS } from "./defaults";
import { Settings, StatusMessage } from "./types";

const form = document.querySelector<HTMLFormElement>("#settings");
const status = document.querySelector<HTMLDivElement>("#status");

const fields = {
  mode: document.querySelector<HTMLSelectElement>("#mode"),
  voiceShortcut: document.querySelector<HTMLInputElement>("#voiceShortcut"),
  enterShortcut: document.querySelector<HTMLInputElement>("#enterShortcut"),
  language: document.querySelector<HTMLSelectElement>("#language"),
  model: document.querySelector<HTMLInputElement>("#model"),
  transcriptionBaseUrl: document.querySelector<HTMLInputElement>("#transcriptionBaseUrl"),
  apiKeyEnvName: document.querySelector<HTMLInputElement>("#apiKeyEnvName"),
  envFilePath: document.querySelector<HTMLInputElement>("#envFilePath"),
  apiKey: document.querySelector<HTMLInputElement>("#apiKey"),
  autoEnterAfterPaste: document.querySelector<HTMLInputElement>("#autoEnterAfterPaste"),
  restoreClipboard: document.querySelector<HTMLInputElement>("#restoreClipboard"),
  reset: document.querySelector<HTMLButtonElement>("#reset")
};

void init();

async function init(): Promise<void> {
  applySettings(await window.voiceInput.getSettings());

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveCurrentSettings();
  });

  fields.reset?.addEventListener("click", () => {
    applySettings(DEFAULT_SETTINGS);
    void saveCurrentSettings("Restored default settings.");
  });

  window.voiceInput.statusChanged((_event: unknown, message: StatusMessage) => {
    setStatus(message.message, message.state === "error");
  });
}

function applySettings(settings: Settings): void {
  setValue(fields.mode, settings.mode);
  setValue(fields.voiceShortcut, settings.voiceShortcut);
  setValue(fields.enterShortcut, settings.enterShortcut);
  setValue(fields.language, settings.language);
  setValue(fields.model, settings.model);
  setValue(fields.transcriptionBaseUrl, settings.transcriptionBaseUrl);
  setValue(fields.apiKeyEnvName, settings.apiKeyEnvName);
  setValue(fields.envFilePath, settings.envFilePath);
  setValue(fields.apiKey, settings.apiKey);

  if (fields.autoEnterAfterPaste) {
    fields.autoEnterAfterPaste.checked = settings.autoEnterAfterPaste;
  }
  if (fields.restoreClipboard) {
    fields.restoreClipboard.checked = settings.restoreClipboard;
  }
}

async function saveCurrentSettings(successMessage = "Settings saved. Shortcuts were re-registered."): Promise<void> {
  const settings: Settings = {
    mode: fields.mode?.value === "hold" ? "hold" : "toggle",
    voiceShortcut: fields.voiceShortcut?.value.trim() || DEFAULT_SETTINGS.voiceShortcut,
    enterShortcut: fields.enterShortcut?.value.trim() || DEFAULT_SETTINGS.enterShortcut,
    language: fields.language?.value ?? DEFAULT_SETTINGS.language,
    model: fields.model?.value.trim() || DEFAULT_SETTINGS.model,
    transcriptionBaseUrl:
      fields.transcriptionBaseUrl?.value.trim() || DEFAULT_SETTINGS.transcriptionBaseUrl,
    apiKeyEnvName: fields.apiKeyEnvName?.value.trim() || DEFAULT_SETTINGS.apiKeyEnvName,
    envFilePath: fields.envFilePath?.value.trim() || "",
    apiKey: fields.apiKey?.value.trim() || "",
    autoEnterAfterPaste: Boolean(fields.autoEnterAfterPaste?.checked),
    restoreClipboard: fields.restoreClipboard?.checked !== false
  };

  const saved = await window.voiceInput.saveSettings(settings);
  applySettings(saved);
  setStatus(successMessage);
}

function setValue(element: HTMLInputElement | HTMLSelectElement | null, value: string): void {
  if (element) {
    element.value = value;
  }
}

function setStatus(message: string, isError = false): void {
  if (!status) {
    return;
  }

  status.textContent = message;
  status.style.color = isError ? "#b91c1c" : "#166534";
}
