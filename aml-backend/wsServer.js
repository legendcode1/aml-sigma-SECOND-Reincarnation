// aml-backend/wsServer.js
const WebSocket = require("ws");
const { getAuthHeaders } = require("./auth");

const wsConnections = {}; // { sessionId: { ws: WebSocket, ready: boolean } }

const setupWebSocketServer = (server) => {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", async (ws, req) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] WebSocket URL:`, req.url);
    const sessionId = req.url.split("/")[2];
    console.log(`[${timestamp}] Extracted sessionId:`, sessionId);
    if (!sessionId || sessionId === "ws") {
      console.error(`[${timestamp}] Invalid session_id:`, sessionId);
      ws.close();
      return;
    }

    try {
      console.log(
        `[${timestamp}] WebSocket connection requested for session ${sessionId}`
      );
      const headers = await getAuthHeaders(process.env.AIGISLLM_BACKEND_URL);
      const aegisWsUrl = `wss://${
        process.env.AIGISLLM_BACKEND_URL.split("//")[1]
      }/ws/${sessionId}`;
      const aegisWs = new WebSocket(aegisWsUrl, {
        headers: { Authorization: headers["Authorization"] },
      });

      // Track the connection
      wsConnections[sessionId] = { ws: aegisWs, ready: false };

      aegisWs.on("open", () => {
        const openTimestamp = new Date().toISOString();
        console.log(
          `[${openTimestamp}] Connected to AegisLLM WebSocket for session ${sessionId}`
        );
        wsConnections[sessionId].ready = true;
      });

      aegisWs.on("message", (message) => {
        const messageTimestamp = new Date().toISOString();
        const messageStr = message.toString();
        console.log(
          `[${messageTimestamp}] Received from AegisLLM:`,
          messageStr
        );
        ws.send(messageStr);
      });

      aegisWs.on("close", () => {
        const closeTimestamp = new Date().toISOString();
        console.log(
          `[${closeTimestamp}] AegisLLM WebSocket closed for session ${sessionId}`
        );
        delete wsConnections[sessionId];
        ws.close();
      });

      aegisWs.on("error", (error) => {
        const errorTimestamp = new Date().toISOString();
        console.error(
          `[${errorTimestamp}] AegisLLM WebSocket error for session ${sessionId}:`,
          error
        );
        delete wsConnections[sessionId];
        ws.close();
      });

      ws.on("close", () => {
        const closeTimestamp = new Date().toISOString();
        console.log(
          `[${closeTimestamp}] Client WebSocket closed for session ${sessionId}`
        );
        if (wsConnections[sessionId]) {
          wsConnections[sessionId].ws.close();
          delete wsConnections[sessionId];
        }
      });

      ws.on("error", (error) => {
        const errorTimestamp = new Date().toISOString();
        console.error(
          `[${errorTimestamp}] Client WebSocket error for session ${sessionId}:`,
          error
        );
        if (wsConnections[sessionId]) {
          wsConnections[sessionId].ws.close();
          delete wsConnections[sessionId];
        }
      });
    } catch (error) {
      const errorTimestamp = new Date().toISOString();
      console.error(
        `[${errorTimestamp}] Error setting up WebSocket for session ${sessionId}:`,
        error
      );
      ws.close();
    }
  });
};

module.exports = { setupWebSocketServer, wsConnections };
