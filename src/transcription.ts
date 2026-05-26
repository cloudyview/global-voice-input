import fs from "node:fs";
import { Settings } from "./types";

interface TranscriptionResponse {
  text?: string;
  error?: {
    message?: string;
  };
}

type EnvMap = Record<string, string>;

const DEFAULT_BASE_URL = "https://api.openai.com/v1";

export async function transcribeAudio(
  audio: Buffer,
  mimeType: string,
  settings: Settings
): Promise<string> {
  const env = readEnvFile(settings.envFilePath);
  const apiKey = resolveApiKey(settings, env);

  if (!apiKey) {
    throw new Error(
      `Missing API key. Set ${settings.apiKeyEnvName}, choose an env file, or enter a key in settings.`
    );
  }

  const baseUrl = resolveBaseUrl(settings, env);
  const endpoint = `${baseUrl.replace(/\/+$/, "")}/audio/transcriptions`;
  const form = new FormData();
  const arrayBuffer = audio.buffer.slice(
    audio.byteOffset,
    audio.byteOffset + audio.byteLength
  ) as ArrayBuffer;
  const file = new Blob([arrayBuffer], { type: mimeType || "audio/webm" });

  form.append("model", settings.model);
  form.append("file", file, "speech.webm");
  form.append("response_format", "json");

  if (settings.language) {
    form.append("language", settings.language);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: form
  });

  const data = (await response.json()) as TranscriptionResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || `Transcription failed: HTTP ${response.status}`);
  }

  const text = data.text?.trim();

  if (!text) {
    throw new Error("No text was recognized.");
  }

  return text;
}

function resolveApiKey(settings: Settings, env: EnvMap): string {
  const envName = settings.apiKeyEnvName || "OPENAI_API_KEY";
  return (
    settings.apiKey ||
    env[envName] ||
    process.env[envName] ||
    env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    ""
  );
}

function resolveBaseUrl(settings: Settings, env: EnvMap): string {
  return (
    settings.transcriptionBaseUrl ||
    env.OPENAI_BASE_URL ||
    process.env.OPENAI_BASE_URL ||
    DEFAULT_BASE_URL
  );
}

function readEnvFile(filePath: string): EnvMap {
  if (!filePath) {
    return {};
  }

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const env: EnvMap = {};

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separator = trimmed.indexOf("=");

      if (separator <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");

      if (key) {
        env[key] = value;
      }
    }

    return env;
  } catch {
    return {};
  }
}
