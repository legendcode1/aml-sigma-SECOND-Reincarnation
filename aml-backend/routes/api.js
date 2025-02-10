// aml-backend/routes/api.js

const express = require('express');
const axios = require('axios'); // Still imported in case you need to switch later
const { getAuthHeaders } = require('../auth'); // Imported for real API mode

const router = express.Router();

// Toggle to true for mock mode (to prevent using real tokens/calling external API)
const USE_MOCK_API = false;

// Mock data generator function (for fallback or testing)
const generateMockReport = (data) => {
  return {
    report: `EDD Report for ${data.pep_name}:
    
- **Session ID:** ${data.session_id}
- **Client ID:** ${data.client_id}
- **Occupation:** ${data.pep_occupation}
- **Age:** ${data.pep_age}
- **Gender:** ${data.pep_gender}

*This is a mock report generated for testing purposes.*`
  };
};

// POST /report
router.post('/report', async (req, res) => {
  const {
    session_id,
    client_id,
    pep_name,
    pep_occupation,
    pep_age,
    pep_gender,
  } = req.body;

  console.log("Received /report request:", req.body);

  // Validate required fields
  if (!session_id || !client_id || !pep_name) {
    console.log("Missing required fields in /report");
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const payload = {
    session_id,
    client_id,
    pep_name,
    pep_occupation,
    pep_age,
    pep_gender,
  };

  if (USE_MOCK_API) {
    // Return mock response
    const mockResponse = generateMockReport(payload);
    console.log("Mock API response:", mockResponse);
    return res.status(200).json(mockResponse);
  } else {
    try {
      console.log("Attempting to obtain auth headers...");
      const headers = await getAuthHeaders(process.env.AIGISLLM_BACKEND_URL);
      console.log("Auth headers obtained:", headers);

      console.log("Sending POST request to external API...");
      const response = await axios.post(
        `${process.env.AIGISLLM_BACKEND_URL}/report`,
        payload,
        { headers }
      );
      console.log("External API response:", response.data);

      return res.status(200).json(response.data);
    } catch (error) {
      console.error("Full error object:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);

      return res.status(error.response?.status || 500).json({
        error: error.response?.data || 'Internal Server Error',
      });
    }
  }
});

// POST /followup
router.post('/followup', async (req, res) => {
  const {
    session_id,
    client_id,
    pep_name,
    pep_occupation,
    pep_age,
    pep_gender,
    chat_history,
    user_message,
  } = req.body;

  console.log("Received /followup request:", req.body);

  // Validate required fields
  if (!session_id || !client_id || !pep_name || !user_message) {
    console.log("Missing required fields in /followup");
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const payload = {
    session_id,
    pep_name,
    pep_occupation,
    pep_age,
    pep_gender,
    chat_history,
    user_message,
  };

  if (USE_MOCK_API) {
    // Return mock response
    const mockResponse = {
      report: `Follow-up EDD Report for ${pep_name}:
      
- **Session ID:** ${session_id}
- **Client ID:** ${client_id}
- **User Message:** "${user_message}"

*This is a mock follow-up report generated for testing purposes.*`
    };
    console.log("Mock API response for followup:", mockResponse);
    return res.status(200).json(mockResponse);
  } else {
    try {
      console.log("Attempting to obtain auth headers for followup...");
      const headers = await getAuthHeaders(process.env.AIGISLLM_BACKEND_URL);
      console.log("Auth headers obtained:", headers);

      console.log("Sending POST request to external API for followup...");
      const response = await axios.post(
        `${process.env.AIGISLLM_BACKEND_URL}/followup`,
        payload,
        {
          headers,
          params: { client_id },
        }
      );
      console.log("External API response for followup:", response.data);

      return res.status(200).json(response.data);
    } catch (error) {
      console.error("Full error object for /followup:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      console.error("Error config:", error.config);

      return res.status(error.response?.status || 500).json({
        error: error.response?.data || 'Internal Server Error',
      });
    }
  }
});

module.exports = router;
