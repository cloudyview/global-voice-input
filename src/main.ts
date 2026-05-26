import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  Menu,
  nativeImage,
  Notification,
  Tray
} from "electron";
import path from "node:path";
import { loadSettings, normalizeSettings, saveSettings } from "./settings-store";
import { transcribeAudio } from "./transcription";
import { RecordingPayload, Settings, StatusMessage } from "./types";
import { pasteText, pressEnter, waitForShortcutRelease } from "./windows-input";

let settings = loadSettings();
let tray: Tray | null = null;
let recorderWindow: BrowserWindow | null = null;
let settingsWindow: BrowserWindow | null = null;
let isRecording = false;
let isTranscribing = false;

app.whenReady().then(async () => {
  createTray();
  createRecorderWindow();
  setupIpc();
  registerShortcuts();
  setStatus("idle", "待命");
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});

function createRecorderWindow(): void {
  recorderWindow = new BrowserWindow({
    width: 360,
    height: 220,
    show: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  void recorderWindow.loadFile(path.join(__dirname, "recorder.html"));
}

function createSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.show();
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 760,
    height: 720,
    title: "Global Voice Input",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  void settingsWindow.loadFile(path.join(__dirname, "settings.html"));
}

function createTray(): void {
  tray = new Tray(createTrayImage("#166534"));
  tray.setToolTip("Global Voice Input");
  updateTrayMenu();
}

function updateTrayMenu(): void {
  if (!tray) {
    return;
  }

  const label = isRecording ? "录音中" : isTranscribing ? "识别中" : "待命";

  tray.setContextMenu(Menu.buildFromTemplate([
    { label: `状态：${label}`, enabled: false },
    { label: `语音键：${settings.voiceShortcut}`, enabled: false },
    { label: `确认键：${settings.enterShortcut}`, enabled: false },
    { type: "separator" },
    { label: "开始/结束语音输入", click: toggleRecording },
    { label: "确认并回车", click: confirmEnter },
    { label: "设置", click: createSettingsWindow },
    { type: "separator" },
    { label: "退出", click: () => app.quit() }
  ]));
}

function createTrayImage(color: string): Electron.NativeImage {
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32">
      <rect width="32" height="32" rx="7" fill="${color}"/>
      <path d="M16 6a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0v-6a4 4 0 0 0-4-4z" fill="white"/>
      <path d="M9 15a7 7 0 0 0 14 0M16 22v4M12 26h8" stroke="white" stroke-width="2" stroke-linecap="round"/>
    </svg>
  `);

  return nativeImage.createFromDataURL(`data:image/svg+xml;charset=utf-8,${svg}`);
}

function setupIpc(): void {
  ipcMain.handle("settings:get", () => settings);

  ipcMain.handle("settings:save", (_event, nextSettings: Settings) => {
    settings = normalizeSettings(nextSettings);
    saveSettings(settings);
    registerShortcuts();
    return settings;
  });

  ipcMain.on("recorder:complete", (_event, payload: RecordingPayload) => {
    const audio = Buffer.from(new Uint8Array(payload.arrayBuffer));
    void handleRecordingComplete(audio, payload.mimeType);
  });

  ipcMain.on("recorder:error", (_event, message: string) => {
    isRecording = false;
    setStatus("error", `录音失败：${message}`);
  });
}

function registerShortcuts(): void {
  globalShortcut.unregisterAll();

  const voiceOk = globalShortcut.register(settings.voiceShortcut, () => {
    void handleVoiceShortcut();
  });

  const enterOk = globalShortcut.register(settings.enterShortcut, () => {
    void confirmEnter();
  });

  if (!voiceOk || !enterOk) {
    setStatus("error", "快捷键注册失败，请换一个没有被系统占用的快捷键。");
  } else {
    setStatus("idle", "快捷键已注册");
  }

  updateTrayMenu();
}

async function handleVoiceShortcut(): Promise<void> {
  if (settings.mode === "hold") {
    if (isRecording || isTranscribing) {
      return;
    }

    startRecording();
    await waitForShortcutRelease(settings.voiceShortcut);
    stopRecording();
    return;
  }

  toggleRecording();
}

function toggleRecording(): void {
  if (isRecording) {
    stopRecording();
    return;
  }

  startRecording();
}

function startRecording(): void {
  if (!recorderWindow || isRecording || isTranscribing) {
    return;
  }

  isRecording = true;
  setStatus("recording", "正在录音");
  recorderWindow.webContents.send("recorder:start");
}

function stopRecording(): void {
  if (!recorderWindow || !isRecording) {
    return;
  }

  isRecording = false;
  isTranscribing = true;
  setStatus("transcribing", "正在识别");
  recorderWindow.webContents.send("recorder:stop");
}

async function handleRecordingComplete(audio: Buffer, mimeType: string): Promise<void> {
  try {
    const text = await transcribeAudio(audio, mimeType, settings);
    await pasteText(text, settings.restoreClipboard);

    if (settings.autoEnterAfterPaste) {
      await pressEnter();
    }

    setStatus("idle", `已输入：${trimForStatus(text)}`);
  } catch (error) {
    setStatus("error", error instanceof Error ? error.message : String(error));
  } finally {
    isRecording = false;
    isTranscribing = false;
    updateTrayMenu();
  }
}

async function confirmEnter(): Promise<void> {
  try {
    await pressEnter();
    setStatus("idle", "已发送回车");
  } catch (error) {
    setStatus("error", error instanceof Error ? error.message : String(error));
  }
}

function setStatus(state: StatusMessage["state"], message: string): void {
  const status: StatusMessage = { state, message };

  if (tray) {
    tray.setImage(createTrayImage(state === "error" ? "#b91c1c" : state === "recording" ? "#dc2626" : "#166534"));
    tray.setToolTip(`Global Voice Input：${message}`);
  }

  settingsWindow?.webContents.send("status:changed", status);
  updateTrayMenu();

  if (state === "error" && Notification.isSupported()) {
    new Notification({ title: "Global Voice Input", body: message }).show();
  }
}

function trimForStatus(text: string): string {
  return text.length > 28 ? `${text.slice(0, 28)}...` : text;
}
