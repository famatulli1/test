import React, { useRef, useEffect, useState } from 'react';
import { Box, IconButton, Paper, Typography, useTheme } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import WaveSurfer from 'wavesurfer.js';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { formatDuration } from '../utils/timeFormat';

interface AudioRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ onRecordingComplete }) => {
  const theme = useTheme();
  const { isRecording, startRecording, stopRecording, error, duration } = useAudioRecording();
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    if (waveformRef.current && !wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: theme.palette.primary.main,
        progressColor: theme.palette.primary.dark,
        cursorColor: theme.palette.primary.dark,
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
  }, [theme]);

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
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        bgcolor: theme.palette.background.paper
      }}
    >
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        {!isRecording ? (
          <IconButton
            onClick={handleStartRecording}
            disabled={!!error}
            color="success"
            size="large"
            sx={{
              bgcolor: theme.palette.success.main + '20',
              '&:hover': {
                bgcolor: theme.palette.success.main + '30',
              }
            }}
          >
            <MicIcon fontSize="large" />
          </IconButton>
        ) : (
          <IconButton
            onClick={handleStopRecording}
            color="error"
            size="large"
            sx={{
              bgcolor: theme.palette.error.main + '20',
              '&:hover': {
                bgcolor: theme.palette.error.main + '30',
              }
            }}
          >
            <StopIcon fontSize="large" />
          </IconButton>
        )}

        {audioUrl && !isRecording && (
          <IconButton
            onClick={togglePlayback}
            color="primary"
            size="large"
            sx={{
              bgcolor: theme.palette.primary.main + '20',
              '&:hover': {
                bgcolor: theme.palette.primary.main + '30',
              }
            }}
          >
            {isPlaying ? <PauseIcon fontSize="large" /> : <PlayArrowIcon fontSize="large" />}
          </IconButton>
        )}

        {(isRecording || audioUrl) && (
          <Typography variant="h6" color="text.secondary">
            {formatDuration(duration)}
          </Typography>
        )}
      </Box>

      {error && (
        <Typography color="error" variant="body2">
          {error}
        </Typography>
      )}

      <Box
        ref={waveformRef}
        sx={{
          width: '100%',
          visibility: audioUrl ? 'visible' : 'hidden',
          bgcolor: theme.palette.background.default,
          borderRadius: 1,
          p: 2
        }}
      />
    </Paper>
  );
};

export default AudioRecorder;
