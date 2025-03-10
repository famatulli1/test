import { useState, useRef, useCallback } from 'react';

interface AudioRecordingHook {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  error: string | null;
  duration: number;
}

export const useAudioRecording = (): AudioRecordingHook => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const startTime = useRef<number>(0);
  const durationInterval = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunks.current = [];
      mediaRecorder.current = new MediaRecorder(stream);

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.start(100); // Collecter les données toutes les 100ms
      startTime.current = Date.now();
      setIsRecording(true);
      setError(null);

      // Mettre à jour la durée toutes les secondes
      durationInterval.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.current) / 1000));
      }, 1000);

    } catch (err) {
      setError('Erreur lors de l\'accès au microphone');
      console.error('Erreur d\'enregistrement:', err);
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!mediaRecorder.current || mediaRecorder.current.state === 'inactive') {
      return null;
    }

    return new Promise((resolve) => {
      if (mediaRecorder.current) {
        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          const stream = mediaRecorder.current?.stream;
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          
          if (durationInterval.current) {
            clearInterval(durationInterval.current);
          }
          
          setIsRecording(false);
          setDuration(0);
          resolve(audioBlob);
        };

        mediaRecorder.current.stop();
      }
    });
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    error,
    duration
  };
};
