import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

const WebSocketContext = createContext();

export const useWebSocketContext = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children, clientId }) => {
  const [sessions, setSessions] = useState({}); // { chatId: { messages: [], ws: WebSocket, latestMessage: string } }

  const startSession = (chatId) => {
    return new Promise((resolve, reject) => {
      if (sessions[chatId]) {
        resolve(); // Session already exists
        return;
      }

      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const protocol = backendUrl.startsWith("https") ? "wss" : "ws";
      const wsUrl = `${protocol}://${backendUrl.split("//")[1]}/ws/${chatId}`;
      console.log("Connecting to WebSocket URL:", wsUrl);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`WebSocket opened for session ${chatId}`);
        resolve(); // Resolve promise when connection is open
      };

      ws.onmessage = async (event) => {
        const data = event.data;
        if (data === "ping") {
          console.log("Received ping, sending pong");
          ws.send("pong");
          return;
        }
        try {
          const message = JSON.parse(data);
          setSessions((prev) => {
            const updatedSessions = { ...prev };
            if (!updatedSessions[chatId]) {
              updatedSessions[chatId] = { messages: [], ws, latestMessage: "" };
            }
            updatedSessions[chatId].messages = [
              ...(updatedSessions[chatId].messages || []),
              message,
            ];
            updatedSessions[chatId].latestMessage =
              message.message || message.query || JSON.stringify(message);
            return updatedSessions;
          });
          // Save to Firestore
          const messageRef = collection(
            db,
            "client",
            clientId,
            "chat_history",
            chatId,
            "messages"
          );
          await addDoc(messageRef, {
            type: "progress",
            content: message,
            timestamp: serverTimestamp(),
          });
          // Update chat status
          const chatRef = doc(db, "client", clientId, "chat_history", chatId);
          await updateDoc(chatRef, { status: "processing" });
        } catch (error) {
          console.error("Error parsing WebSocket message:", error, "Raw data:", data);
        }
      };

      ws.onclose = () => {
        console.log(`WebSocket closed for chat ${chatId}`);
        setSessions((prev) => {
          const updatedSessions = { ...prev };
          delete updatedSessions[chatId];
          return updatedSessions;
        });
      };

      ws.onerror = (error) => {
        console.error(`WebSocket error for chat ${chatId}:`, error);
        reject(error); // Reject promise on error
      };

      setSessions((prev) => ({
        ...prev,
        [chatId]: { messages: [], ws, latestMessage: "" },
      }));
    });
  };

  const stopSession = (chatId) => {
    if (sessions[chatId]) {
      sessions[chatId].ws.close();
      setSessions((prev) => {
        const updatedSessions = { ...prev };
        delete updatedSessions[chatId];
        return updatedSessions;
      });
      // Update localStorage to remove this session
      const ongoingSessions = JSON.parse(localStorage.getItem("ongoingSessions") || "[]");
      const updatedOngoingSessions = ongoingSessions.filter(session => session.chatId !== chatId);
      localStorage.setItem("ongoingSessions", JSON.stringify(updatedOngoingSessions));
    }
  };

  // Reconnect to ongoing "processing" sessions on app load
  useEffect(() => {
    const ongoingSessions = JSON.parse(localStorage.getItem("ongoingSessions") || "[]");
    if (!ongoingSessions.length || !clientId) return;

    ongoingSessions.forEach(async ({ chatId }) => {
      const chatRef = doc(db, "client", clientId, "chat_history", chatId);
      const docSnap = await getDoc(chatRef);
      if (docSnap.exists() && docSnap.data().status === "processing") {
        startSession(chatId); // Only reconnect if still processing
      }
    });
  }, [clientId]);

  // Update localStorage when sessions change
  useEffect(() => {
    const ongoingSessions = Object.keys(sessions).map(chatId => ({ chatId }));
    localStorage.setItem("ongoingSessions", JSON.stringify(ongoingSessions));
  }, [sessions]);

  return (
    <WebSocketContext.Provider value={{ sessions, startSession, stopSession }}>
      {children}
    </WebSocketContext.Provider>
  );
};