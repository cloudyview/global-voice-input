import { contextBridge, ipcRenderer } from "electron";
import { RecordingPayload, Settings, StatusMessage } from "./types";

contextBridge.exposeInMainWorld("voiceInput", {
  getSettings: () => ipcRenderer.invoke("settings:get") as Promise<Settings>,
  saveSettings: (settings: Settings) => ipcRenderer.invoke("settings:save", settings) as Promise<Settings>,
  startRecording: (handler: () => void) => ipcRenderer.on("recorder:start", handler),
  stopRecording: (handler: () => void) => ipcRenderer.on("recorder:stop", handler),
  recordingComplete: (payload: RecordingPayload) => ipcRenderer.send("recorder:complete", payload),
  recordingError: (message: string) => ipcRenderer.send("recorder:error", message),
  statusChanged: (handler: (_event: unknown, status: StatusMessage) => void) => {
    ipcRenderer.on("status:changed", handler);
  }
});
