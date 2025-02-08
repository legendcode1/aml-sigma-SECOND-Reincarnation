// src/indexedDB.js
import { openDB } from 'idb';

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

export const addChatMessage = async (message) => {
  const db = await initDB();
  // If message.timestamp is a Firestore Timestamp, convert it; otherwise assume it's a number
  const timestamp =
    message.timestamp && typeof message.timestamp.toMillis === 'function'
      ? message.timestamp.toMillis()
      : message.timestamp || Date.now();
  return db.put('chatHistory', {
    ...message,
    timestamp,
  });
};

export const loadChatMessagesFirestore = async (messages) => {
  const db = await initDB();
  const tx = db.transaction('chatHistory', 'readwrite');
  const store = tx.objectStore('chatHistory');
  for (const message of messages) {
    // Convert Firestore Timestamp to a number if needed
    const timestamp =
      message.timestamp && typeof message.timestamp.toMillis === 'function'
        ? message.timestamp.toMillis()
        : message.timestamp || Date.now();
    await store.put({
      ...message,
      timestamp,
    });
  }
  await tx.done;
};

export const getChatMessages = async () => {
  const db = await initDB();
  return db.getAll('chatHistory');
};

export const clearChatHistory = async () => {
  const db = await initDB();
  return db.clear('chatHistory');
};
