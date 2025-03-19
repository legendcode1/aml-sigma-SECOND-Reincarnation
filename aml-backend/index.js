// aml-backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const WebSocket = require('ws');
const { getAuthHeaders } = require('./auth');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use the router for routes starting with /api
app.use('/api', apiRoutes);

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', async (ws, req) => {
  console.log('WebSocket URL:', req.url);
  const sessionId = req.url.split('/')[2];
  console.log('Extracted sessionId:', sessionId);
  if (!sessionId || sessionId === 'ws') {
    console.error('Invalid session_id:', sessionId);
    ws.close();
    return;
  }

  try {
    console.log(`WebSocket connection requested for session ${sessionId}`);
    const headers = await getAuthHeaders(process.env.AIGISLLM_BACKEND_URL);
    const aegisWsUrl = `wss://${process.env.AIGISLLM_BACKEND_URL.split('//')[1]}/ws/${sessionId}`;
    const aegisWs = new WebSocket(aegisWsUrl, {
      headers: { Authorization: headers['Authorization'] },
    });

    aegisWs.on('open', () => {
      console.log(`Connected to AegisLLM WebSocket for session ${sessionId}`);
    });

    aegisWs.on('message', (message) => {
      console.log(`Received from AegisLLM:`, message.toString()); // Log raw message
      ws.send(message.toString()); // Forward message to frontend as string
    });

    aegisWs.on('close', () => {
      console.log(`AegisLLM WebSocket closed for session ${sessionId}`);
      ws.close();
    });

    aegisWs.on('error', (error) => {
      console.error(`AegisLLM WebSocket error for session ${sessionId}:`, error);
      ws.close();
    });

    ws.on('close', () => {
      console.log(`Client WebSocket closed for session ${sessionId}`);
      aegisWs.close();
    });

    ws.on('error', (error) => {
      console.error(`Client WebSocket error for session ${sessionId}:`, error);
      aegisWs.close();
    });
  } catch (error) {
    console.error(`Error setting up WebSocket for session ${sessionId}:`, error);
    ws.close();
  }
});