const API_BASE_URL = "http://localhost:8000";

export interface STTResponse {
  text: string;
  success: boolean;
  error?: string;
}

export interface IntentResponse {
  action: string;
  title: string;
  time?: string;
  details: string;
  confidence: number;
}

export interface ExecuteResponse {
  success: boolean;
  result: string;
  intent: IntentResponse;
  mock?: boolean;
}

export async function uploadAudioForSTT(audioUri: string): Promise<STTResponse> {
  try {
    const formData = new FormData();

    // Create file object for the audio
    formData.append("audio", {
      uri: audioUri,
      type: "audio/m4a",
      name: "recording.m4a",
    } as any);

    const response = await fetch(`${API_BASE_URL}/stt`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text || "",
      success: true,
    };
  } catch (error) {
    console.error("Error uploading audio:", error);
    return {
      text: "",
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

export async function parseIntent(text: string): Promise<IntentResponse> {
  const response = await fetch(`${API_BASE_URL}/intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function executeIntent(intent: IntentResponse): Promise<ExecuteResponse> {
  const response = await fetch(`${API_BASE_URL}/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(intent),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function textToSpeech(text: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  // Return the audio URL for playback
  const blob = await response.blob();
  return URL.createObjectURL(blob);
}
