import { Settings } from "./types";

interface TranscriptionResponse {
  text?: string;
  error?: {
    message?: string;
  };
}

export async function transcribeAudio(
  audio: Buffer,
  mimeType: string,
  settings: Settings
): Promise<string> {
  const apiKey = settings.apiKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("缺少 OpenAI API Key。请在设置里填写，或设置 OPENAI_API_KEY 环境变量。");
  }

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

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`
    },
    body: form
  });

  const data = (await response.json()) as TranscriptionResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || `转写失败：HTTP ${response.status}`);
  }

  const text = data.text?.trim();

  if (!text) {
    throw new Error("没有识别到文字。");
  }

  return text;
}
