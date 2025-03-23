// aml-backend/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const apiRoutes = require("./routes/api");
const { setupWebSocketServer } = require("./wsServer");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use the router for routes starting with /api
app.use("/api", apiRoutes);

// Start HTTP server and WebSocket server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

setupWebSocketServer(server);
