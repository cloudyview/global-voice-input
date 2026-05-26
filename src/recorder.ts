let stream: MediaStream | null = null;
let recorder: MediaRecorder | null = null;
let chunks: Blob[] = [];

window.voiceInput.startRecording(async () => {
  try {
    if (!stream) {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    }

    chunks = [];
    const mimeType = getPreferredMimeType();
    recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };

    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: recorder?.mimeType || "audio/webm" });
      const arrayBuffer = await blob.arrayBuffer();
      window.voiceInput.recordingComplete({
        arrayBuffer,
        mimeType: blob.type || "audio/webm"
      });
    };

    recorder.start();
  } catch (error) {
    window.voiceInput.recordingError(error instanceof Error ? error.message : String(error));
  }
});

window.voiceInput.stopRecording(() => {
  if (recorder && recorder.state !== "inactive") {
    recorder.stop();
  }
});

function getPreferredMimeType(): string {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus"
  ];

  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) || "";
}
