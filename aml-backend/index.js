// aml-backend/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');

dotenv.config();

console.log("Environment Variables:");
console.log("PORT:", process.env.PORT);
console.log("AIGISLLM_BACKEND_URL:", process.env.AIGISLLM_BACKEND_URL);
console.log("SERVICE_ACCOUNT_FILE:", process.env.SERVICE_ACCOUNT_FILE);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Use the router for routes starting with /api
app.use('/api', apiRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
