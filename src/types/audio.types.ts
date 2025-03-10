export interface AudioRecord {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: number;
  transcription?: {
    text: string;
    segments: TranscriptionSegment[];
  };
  editHistory: EditAction[];
}

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
}

export interface EditAction {
  type: 'cut' | 'replace' | 'merge';
  timestamp: number;
  data: {
    start: number;
    end: number;
    replacement?: Blob;
  };
}

export interface WhisperConfig {
  apiKey: string;
  model: "whisper-1";
  language?: string;
  responseFormat: "json" | "text" | "srt" | "verbose_json" | "vtt";
}
