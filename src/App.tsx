import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Box, Container, Typography, Paper, List, ListItem, IconButton, Alert, Snackbar, useTheme } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AudioRecorder from './components/AudioRecorder';
import ThemeToggle from './components/ThemeToggle';
import { whisperService } from './services/whisperService';
import { storageService } from './services/storageService';
import { AudioRecord } from './types/audio.types';
import { formatDuration } from './utils/timeFormat';

const AppContent: React.FC = () => {
  const [records, setRecords] = useState<AudioRecord[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const loadedRecords = await storageService.getRecords();
      setRecords(loadedRecords);
    } catch (err) {
      setError('Erreur lors du chargement des enregistrements');
      console.error(err);
    }
  };

  const handleRecordingComplete = async (blob: Blob) => {
    const newRecord: AudioRecord = {
      id: uuidv4(),
      blob,
      duration: Math.ceil(blob.size / 44100),
      timestamp: Date.now(),
      editHistory: []
    };

    try {
      await storageService.saveRecord(newRecord);
      setRecords(prev => [...prev, newRecord]);
      
      setIsTranscribing(true);
      setError(null);
      
      const transcription = await whisperService.transcribe(blob);
      
      const updatedRecord = {
        ...newRecord,
        transcription: {
          text: transcription,
          segments: []
        }
      };
      
      await storageService.saveRecord(updatedRecord);
      setRecords(prev => prev.map(r => 
        r.id === updatedRecord.id ? updatedRecord : r
      ));
      
    } catch (err) {
      setError('Erreur lors de la transcription');
      console.error(err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      await storageService.deleteRecord(id);
      setRecords(prev => prev.filter(record => record.id !== id));
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      pt: 3,
      pb: 8
    }}>
      <ThemeToggle />
      <Container maxWidth="md">
        <Typography 
          variant="h3" 
          component="h1" 
          align="center"
          color="primary"
          gutterBottom
          sx={{ mb: 4 }}
        >
          Dictaphone Avancé
        </Typography>

        <AudioRecorder onRecordingComplete={handleRecordingComplete} />

        <Box sx={{ mt: 6 }}>
          <Typography 
            variant="h5" 
            component="h2"
            gutterBottom
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            Enregistrements
            {isTranscribing && (
              <Typography variant="body2" color="text.secondary">
                (Transcription en cours...)
              </Typography>
            )}
          </Typography>

          {records.length === 0 ? (
            <Typography 
              variant="body1" 
              color="text.secondary"
              align="center"
              sx={{ mt: 4 }}
            >
              Aucun enregistrement
            </Typography>
          ) : (
            <List>
              {records.map(record => (
                <ListItem
                  key={record.id}
                  component={Paper}
                  sx={{ 
                    mb: 2,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}
                  elevation={2}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    width: '100%',
                    color: 'text.secondary'
                  }}>
                    <Typography variant="body2">
                      {new Date(record.timestamp).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      {formatDuration(record.duration)}
                    </Typography>
                  </Box>

                  {record.transcription && (
                    <Paper 
                      variant="outlined" 
                      sx={{ 
                        p: 2,
                        bgcolor: theme.palette.action.hover,
                        width: '100%'
                      }}
                    >
                      <Typography variant="body1">
                        {record.transcription.text}
                      </Typography>
                    </Paper>
                  )}

                  <Box sx={{ alignSelf: 'flex-end' }}>
                    <IconButton
                      onClick={() => handleDeleteRecord(record.id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </Container>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert 
          onClose={() => setError(null)} 
          severity="error" 
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <AppContent />
  );
};

export default App;
