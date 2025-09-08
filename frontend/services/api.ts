const API_BASE_URL = 'http://localhost:3000';

export interface STTResponse {
  text: string;
  success: boolean;
  error?: string;
}

export async function uploadAudioForSTT(audioUri: string): Promise<STTResponse> {
  try {
    const formData = new FormData();
    
    // Create file object for the audio
    formData.append('audio', {
      uri: audioUri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any);

    const response = await fetch(`${API_BASE_URL}/stt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text || '',
      success: true,
    };
  } catch (error) {
    console.error('Error uploading audio:', error);
    return {
      text: '',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}