// parrot-aml/src/utils/websocket.js
import { useState, useEffect } from "react";

const useWebSocket = (sessionId) => {
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const protocol = backendUrl.startsWith("https") ? "wss" : "ws";
    const wsUrl = `${protocol}://${backendUrl.split("//")[1]}/ws/${sessionId}`;
    console.log("Connecting to WebSocket URL:", wsUrl); // Add this
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log(`WebSocket connected for session ${sessionId}`);
      console.log("Connecting to WebSocket URL:", wsUrl);
    };

    websocket.onmessage = (event) => {
      console.log("Raw WebSocket message received:", event.data);
      if (event.data === "ping") {
        console.log("Received ping, ignoring...");
        return;
      }
      try {
        const message = JSON.parse(event.data);
        console.log("Parsed WebSocket message:", message);
        setMessages((prev) => [...prev, message]);
      } catch (error) {
        console.error(
          "Error parsing WebSocket message:",
          error,
          "Raw data:",
          event.data
        );
      }
    };

    websocket.onclose = () => {
      console.log(`WebSocket disconnected for session ${sessionId}`);
    };

    websocket.onerror = (error) => {
      console.error(`WebSocket error for session ${sessionId}:`, error);
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [sessionId]);

  return { messages, ws };
};

export default useWebSocket;
