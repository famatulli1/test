import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import App from './App';
import { whisperService } from './services/whisperService';
import { ThemeProvider } from './contexts/ThemeContext';

// Configuration de Whisper avec la clé API
whisperService.configure({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  model: 'whisper-1',
  responseFormat: 'json',
  language: 'fr'
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
