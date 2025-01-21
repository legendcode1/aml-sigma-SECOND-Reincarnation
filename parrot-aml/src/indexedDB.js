// filepath: /c:/Users/Ananta Anugrah/Desktop/aml sigma SECOND Reincarnation/parrot-aml/src/indexedDB.js
import { openDB } from 'idb';

// Initialize the database
const initDB = async () => {
  return openDB('ChatHistoryDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('chatHistory')) {
        const store = db.createObjectStore('chatHistory', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    },
  });
};

// Add a chat message
export const addChatMessage = async (message) => {
  const db = await initDB();
  return db.put('chatHistory', {
    ...message,
    timestamp: Date.now(),
  });
};

// Import data from Firestore and add to IndexedDB
export const loadChatMessagesFirestore = async (messages) => {
  const db = await initDB();
  const tx = db.transaction('chatHistory', 'readwrite');
  const store = tx.objectStore('chatHistory');
  messages.forEach(async (message) => {
    await store.put({
      ...message,
      timestamp: Date.now(),
    });
  });
  await tx.done;
};

// Get all chat messages
export const getChatMessages = async () => {
  const db = await initDB();
  return db.getAll('chatHistory');
};

// Delete all chat history
export const clearChatHistory = async () => {
  const db = await initDB();
  return db.clear('chatHistory');
};