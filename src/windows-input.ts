import { clipboard } from "electron";
import { spawn } from "node:child_process";

const KEY_CODES: Record<string, number> = {
  F1: 0x70,
  F2: 0x71,
  F3: 0x72,
  F4: 0x73,
  F5: 0x74,
  F6: 0x75,
  F7: 0x76,
  F8: 0x77,
  F9: 0x78,
  F10: 0x79,
  F11: 0x7a,
  F12: 0x7b,
  Space: 0x20,
  Enter: 0x0d
};

export async function pasteText(text: string, restoreClipboard: boolean): Promise<void> {
  const previousText = clipboard.readText();
  clipboard.writeText(text);
  await sendKeys("^v");

  if (restoreClipboard) {
    setTimeout(() => clipboard.writeText(previousText), 900);
  }
}

export async function pressEnter(): Promise<void> {
  await sendKeys("{ENTER}");
}

export function waitForShortcutRelease(shortcut: string): Promise<void> {
  const key = shortcut.split("+").pop()?.trim() || shortcut;
  const code = KEY_CODES[key];

  if (!code) {
    return Promise.resolve();
  }

  const script = [
    "Add-Type -TypeDefinition 'using System; using System.Runtime.InteropServices; public static class K { [DllImport(\"user32.dll\")] public static extern short GetAsyncKeyState(int vKey); }';",
    `$k=${code};`,
    "while (([K]::GetAsyncKeyState($k) -band 0x8000) -ne 0) { Start-Sleep -Milliseconds 25 }"
  ].join(" ");

  return runPowerShell(script);
}

function sendKeys(keys: string): Promise<void> {
  const escaped = keys.replace(/'/g, "''");
  return runPowerShell(`Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('${escaped}')`);
}

function runPowerShell(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("powershell.exe", [
      "-NoProfile",
      "-WindowStyle",
      "Hidden",
      "-Command",
      command
    ], {
      windowsHide: true
    });

    let errorOutput = "";
    child.stderr.on("data", (chunk: Buffer) => {
      errorOutput += chunk.toString();
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(errorOutput || `PowerShell exited with code ${code}`));
      }
    });
  });
}
