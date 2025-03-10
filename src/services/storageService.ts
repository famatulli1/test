import { AudioRecord } from '../types/audio.types';

class StorageService {
  private readonly STORAGE_KEY = 'dictaphone_records';

  async saveRecord(record: AudioRecord): Promise<void> {
    const records = await this.getRecords();
    records.push(record);
    
    const serializedRecords = records.map(record => ({
      ...record,
      blob: null // On ne stocke pas le blob dans le localStorage
    }));
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializedRecords));
    
    // Stocker le blob séparément dans IndexedDB
    await this.saveBlobToIndexedDB(record.id, record.blob);
  }

  async getRecords(): Promise<AudioRecord[]> {
    const recordsJson = localStorage.getItem(this.STORAGE_KEY);
    const records = recordsJson ? JSON.parse(recordsJson) : [];
    
    // Récupérer les blobs depuis IndexedDB
    const completeRecords = await Promise.all(
      records.map(async (record: AudioRecord) => {
        const blob = await this.getBlobFromIndexedDB(record.id);
        return { ...record, blob };
      })
    );
    
    return completeRecords;
  }

  private async saveBlobToIndexedDB(id: string, blob: Blob): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DictaphoneDB', 1);

      request.onerror = () => reject(request.error);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('audioBlobs')) {
          db.createObjectStore('audioBlobs');
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['audioBlobs'], 'readwrite');
        const store = transaction.objectStore('audioBlobs');
        
        store.put(blob, id);
        
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        
        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      };
    });
  }

  private async getBlobFromIndexedDB(id: string): Promise<Blob | null> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DictaphoneDB', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['audioBlobs'], 'readonly');
        const store = transaction.objectStore('audioBlobs');
        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
          db.close();
          resolve(getRequest.result);
        };

        getRequest.onerror = () => {
          db.close();
          reject(getRequest.error);
        };
      };
    });
  }

  async deleteRecord(id: string): Promise<void> {
    const records = await this.getRecords();
    const updatedRecords = records.filter(record => record.id !== id);
    
    const serializedRecords = updatedRecords.map(record => ({
      ...record,
      blob: null
    }));
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serializedRecords));
    
    // Supprimer le blob de IndexedDB
    await this.deleteBlobFromIndexedDB(id);
  }

  private async deleteBlobFromIndexedDB(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('DictaphoneDB', 1);

      request.onerror = () => reject(request.error);

      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['audioBlobs'], 'readwrite');
        const store = transaction.objectStore('audioBlobs');
        
        store.delete(id);
        
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
        
        transaction.onerror = () => {
          db.close();
          reject(transaction.error);
        };
      };
    });
  }
}

export const storageService = new StorageService();
