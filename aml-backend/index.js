// aml-backend/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { WebSocketServer, WebSocket } = require('ws');
const http = require('http');
const apiRoutes = require('./routes/api');
const { getAuthHeaders } = require('./auth');

dotenv.config();

console.log("Environment Variables:");
console.log("PORT:", process.env.PORT);
console.log("AIGISLLM_BACKEND_URL:", process.env.AIGISLLM_BACKEND_URL);
console.log("SERVICE_ACCOUNT_FILE:", process.env.SERVICE_ACCOUNT_FILE);

const app = express();
const server = http.createServer(app);

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:5173', // Allow only the frontend origin
  methods: ['GET', 'POST', 'OPTIONS'], // Allow specific methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
  credentials: true, // Allow credentials if needed (e.g., cookies)
}));

app.use(express.json());

// Use the router for routes starting with /api
app.use('/api', apiRoutes);

// WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', async (ws, req) => {
  const sessionId = req.url.split('/ws/')[1];
  console.log('WebSocket client connected for session:', sessionId);

  ws.on('message', (message) => {
    console.log('Received WebSocket message from client:', message.toString());
    ws.send(`Server received: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected for session:', sessionId);
  });

  const cloudWsUrl = `${process.env.AIGISLLM_BACKEND_URL.replace('http', 'ws')}/ws/${sessionId}`;
  console.log('Connecting to Cloud Run WebSocket:', cloudWsUrl);

  try {
    const headers = await getAuthHeaders(process.env.AIGISLLM_BACKEND_URL);
    console.log('Generated headers for Cloud Run WebSocket:', headers);
    const cloudWs = new WebSocket(cloudWsUrl, { headers });

    cloudWs.on('open', () => {
      console.log('Connected to Cloud Run WebSocket for session:', sessionId);
      ws.send(JSON.stringify({ type: 'status', message: 'WebSocket connected to backend' }));

      const keepAliveInterval = setInterval(() => {
        if (cloudWs.readyState === WebSocket.OPEN) {
          cloudWs.ping();
          console.log('Sent keep-alive ping for session:', sessionId);
        }
      }, 25000);
    });

    cloudWs.on('message', (data) => {
      console.log('Received from Cloud Run:', data.toString());
      ws.send(data);
    });

    cloudWs.on('error', (error) => {
      console.error('Cloud Run WebSocket error:', error.message, error);
      ws.send(JSON.stringify({ type: 'error', message: 'WebSocket connection to backend failed' }));
      clearInterval(keepAliveInterval);
    });

    cloudWs.on('close', (code, reason) => {
      console.log('Cloud Run WebSocket closed:', { sessionId, code, reason: reason.toString() });
      ws.close();
      clearInterval(keepAliveInterval);
    });

    ws.on('close', () => {
      cloudWs.close();
      clearInterval(keepAliveInterval);
    });
  } catch (error) {
    console.error('Failed to initialize WebSocket to Cloud Run:', error.message, error);
    ws.send(JSON.stringify({ type: 'error', message: 'Failed to connect to backend WebSocket' }));
    ws.close();
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});