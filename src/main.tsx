import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { whisperService } from './services/whisperService';

// Configuration de Whisper avec la clé API
whisperService.configure({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  model: 'whisper-1',
  responseFormat: 'json',
  language: 'fr'
});

// Style global
const style = document.createElement('style');
style.textContent = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f0f2f5;
    color: #333;
    line-height: 1.5;
  }

  button {
    font-family: inherit;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
