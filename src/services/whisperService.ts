import { WhisperConfig } from '../types/audio.types';

class WhisperService {
  private config: WhisperConfig | null = null;

  configure(config: WhisperConfig) {
    this.config = config;
  }

  async transcribe(audioBlob: Blob): Promise<string> {
    if (!this.config) {
      throw new Error('Whisper service not configured. Please call configure() first.');
    }

    try {
      // Convertir le Blob WAV en MP3 si nécessaire ici
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.wav');
      formData.append('model', this.config.model);
      formData.append('response_format', this.config.responseFormat);
      if (this.config.language) {
        formData.append('language', this.config.language);
      }

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Transcription failed');
      }

      const result = await response.json();
      return result.text;

    } catch (error) {
      console.error('Transcription error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const whisperService = new WhisperService();
