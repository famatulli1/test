import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import AudioRecorder from './components/AudioRecorder';
import { whisperService } from './services/whisperService';
import { storageService } from './services/storageService';
import { AudioRecord } from './types/audio.types';
import { formatDuration } from './utils/timeFormat';

const App: React.FC = () => {
  const [records, setRecords] = useState<AudioRecord[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      duration: Math.ceil(blob.size / 44100), // Estimation approximative
      timestamp: Date.now(),
      editHistory: []
    };

    try {
      await storageService.saveRecord(newRecord);
      setRecords(prev => [...prev, newRecord]);
      
      // Lancer la transcription
      setIsTranscribing(true);
      setError(null);
      
      const transcription = await whisperService.transcribe(blob);
      
      const updatedRecord = {
        ...newRecord,
        transcription: {
          text: transcription,
          segments: [] // À implémenter avec la version complète de l'API Whisper
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
    <div className="app-container">
      <header>
        <h1>Dictaphone Avancé</h1>
      </header>

      <main>
        <AudioRecorder onRecordingComplete={handleRecordingComplete} />

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="records-list">
          <h2>Enregistrements {isTranscribing && <span>(Transcription en cours...)</span>}</h2>
          
          {records.length === 0 ? (
            <p className="no-records">Aucun enregistrement</p>
          ) : (
            records.map(record => (
              <div key={record.id} className="record-item">
                <div className="record-info">
                  <span className="record-date">
                    {new Date(record.timestamp).toLocaleString()}
                  </span>
                  <span className="record-duration">
                    {formatDuration(record.duration)}
                  </span>
                </div>
                
                {record.transcription && (
                  <div className="transcription">
                    {record.transcription.text}
                  </div>
                )}
                
                <div className="record-actions">
                  <button 
                    onClick={() => handleDeleteRecord(record.id)}
                    className="delete-button"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <style>{`
        .app-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        header {
          text-align: center;
          margin-bottom: 40px;
        }

        header h1 {
          color: #2196F3;
          margin: 0;
        }

        .error-banner {
          background-color: #ffebee;
          color: #f44336;
          padding: 10px 20px;
          border-radius: 4px;
          margin: 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .error-banner button {
          background: none;
          border: none;
          color: #f44336;
          font-size: 20px;
          cursor: pointer;
        }

        .records-list {
          margin-top: 40px;
        }

        .records-list h2 {
          color: #333;
          margin-bottom: 20px;
        }

        .records-list h2 span {
          font-size: 0.8em;
          color: #666;
          font-weight: normal;
        }

        .no-records {
          text-align: center;
          color: #666;
          font-style: italic;
        }

        .record-item {
          background: white;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .record-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          color: #666;
          font-size: 0.9em;
        }

        .transcription {
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
          margin: 10px 0;
          font-size: 0.95em;
          line-height: 1.4;
        }

        .record-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .delete-button {
          background-color: #ff5252;
          color: white;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
        }

        .delete-button:hover {
          background-color: #ff1744;
        }
      `}</style>
    </div>
  );
};

export default App;
