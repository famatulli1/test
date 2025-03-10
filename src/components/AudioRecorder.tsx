import React, { useRef, useEffect, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { formatDuration } from '../utils/timeFormat';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const { isRecording, startRecording, stopRecording, error, duration } = useAudioRecording();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: '#4a9eff',
        progressColor: '#1e88e5',
        cursorColor: '#1e88e5',
        barWidth: 2,
        barRadius: 3,
        cursorWidth: 1,
        height: 80,
        barGap: 2
      });

      wavesurferRef.current.on('finish', () => setIsPlaying(false));
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, []);

  const handleStartRecording = async () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    await startRecording();
  };

  const handleStopRecording = async () => {
    const audioBlob = await stopRecording();
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);
      onRecordingComplete(audioBlob);

      if (wavesurferRef.current) {
        wavesurferRef.current.loadBlob(audioBlob);
      }
    }
  };

  const togglePlayback = () => {
    if (wavesurferRef.current) {
      if (isPlaying) {
        wavesurferRef.current.pause();
      } else {
        wavesurferRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="audio-recorder">
      <div className="controls">
        {!isRecording ? (
          <button 
            onClick={handleStartRecording}
            className="record-button"
            disabled={!!error}
          >
            Démarrer l'enregistrement
          </button>
        ) : (
          <button 
            onClick={handleStopRecording}
            className="stop-button"
          >
            Arrêter l'enregistrement ({formatDuration(duration)})
          </button>
        )}

        {audioUrl && !isRecording && (
          <button 
            onClick={togglePlayback}
            className="playback-button"
          >
            {isPlaying ? 'Pause' : 'Lecture'}
          </button>
        )}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div 
        ref={waveformRef}
        className="waveform-container"
        style={{
          visibility: audioUrl ? 'visible' : 'hidden',
          marginTop: '20px'
        }}
      />

      <style>{`
        .audio-recorder {
          padding: 20px;
          border-radius: 8px;
          background: #f5f5f5;
          max-width: 600px;
          margin: 0 auto;
        }

        .controls {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        button {
          padding: 10px 20px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .record-button {
          background-color: #4CAF50;
          color: white;
        }

        .stop-button {
          background-color: #f44336;
          color: white;
        }

        .playback-button {
          background-color: #2196F3;
          color: white;
        }

        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .error-message {
          color: #f44336;
          margin-top: 10px;
          font-size: 14px;
        }

        .waveform-container {
          background: white;
          padding: 10px;
          border-radius: 4px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default AudioRecorder;
