// aml-backend/routes/api.js
const express = require("express");
const axios = require("axios");
const { getAuthHeaders } = require("../auth");
const { wsConnections } = require("../wsServer");

const router = express.Router();

// Toggle to true for mock mode
const USE_MOCK_API = false;

const generateMockReport = (data) => {
  return {
    report: `EDD Report for ${data.pep_name}:
    
- **Session ID:** ${data.session_id}
- **Client ID:** ${data.client_id}
- **Occupation:** ${data.pep_occupation}
- **Age:** ${data.pep_age}
- **Gender:** ${data.pep_gender}
- **UID:** ${data.UID}

*This is a mock report generated for testing purposes.*`,
  };
};

// POST /report
router.post("/report", async (req, res) => {
  const {
    session_id,
    client_id,
    pep_name,
    pep_occupation,
    pep_age,
    pep_gender,
    UID,
  } = req.body;

  console.log("Received /report request:", req.body);

  // Validate required fields
  if (!session_id || !client_id || !pep_name || !UID) {
    console.log("Missing required fields in /report");
    return res.status(400).json({
      error:
        "Missing required fields: session_id, client_id, pep_name, and UID are required",
    });
  }

  // Function to wait for WebSocket readiness
  const waitForWs = () =>
    new Promise((resolve, reject) => {
      const startTime = Date.now();
      const timeout = 15000;
      const checkWs = () => {
        if (wsConnections[session_id] && wsConnections[session_id].ready) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(
            new Error(
              `WebSocket for session ${session_id} not ready within ${timeout}ms`
            )
          );
        } else {
          setTimeout(checkWs, 100);
        }
      };
      checkWs();
    });

  const payload = {
    session_id,
    client_id,
    pep_name,
    pep_occupation,
    pep_age,
    pep_gender,
    UID,
  };

  if (USE_MOCK_API) {
    const mockResponse = generateMockReport(payload);
    console.log("Mock API response:", mockResponse);
    return res.status(200).json(mockResponse);
  } else {
    try {
      console.log(
        `Waiting for WebSocket for session ${session_id} to be ready...`
      );
      await waitForWs();
      console.log(`WebSocket for session ${session_id} is ready.`);

      console.log("Attempting to obtain auth headers...");
      const headers = await getAuthHeaders(process.env.AIGISLLM_BACKEND_URL);
      console.log("Auth headers obtained:", headers);

      console.log("Sending POST request to external API...");
      const response = await axios.post(
        `${process.env.AIGISLLM_BACKEND_URL}/report`,
        payload,
        {
          headers,
          timeout: 900000, // 15 minutes
        }
      );
      console.log("External API response:", response.data);

      return res.status(200).json(response.data);
    } catch (error) {
      console.error("Full error object:", error);
      if (error.message && error.message.includes("WebSocket for session")) {
        console.error("WebSocket not ready:", error.message);
        return res
          .status(503)
          .json({ error: "WebSocket connection not ready" });
      }
      if (error.code === "ECONNRESET") {
        console.error("Connection reset by AegisLLM server");
        return res
          .status(504)
          .json({ error: "Gateway timeout: AegisLLM connection reset" });
      }
      if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
        console.error("Request timed out after 15 minutes");
        return res.status(504).json({
          error:
            "Gateway timeout: Request took longer than 15 minutes. Check WebSocket updates.",
        });
      }
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        console.error("Error response headers:", error.response.headers);
        return res
          .status(error.response.status)
          .json({ error: error.response.data });
      } else if (error.request) {
        console.error("No response received:", error.request);
        return res
          .status(504)
          .json({ error: "No response received from AegisLLM" });
      } else {
        console.error("Error message:", error.message);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    }
  }
});

// POST /followup
router.post("/followup", async (req, res) => {
  const {
    session_id,
    client_id,
    pep_name,
    pep_occupation,
    pep_age,
    pep_gender,
    chat_history,
    user_message,
    UID, // Extract UID from request body
  } = req.body;

  console.log("Received /followup request:", req.body);

  if (!session_id || !client_id || !pep_name || !user_message || !UID) {
    console.log("Missing required fields in /followup");
    return res.status(400).json({
      error:
        "Missing required fields: session_id, client_id, pep_name, user_message, and UID are required",
    });
  }

  const payload = {
    session_id,
    client_id, // Include client_id in the payload
    pep_name,
    pep_occupation,
    pep_age,
    pep_gender,
    chat_history,
    user_message,
    UID, // Include UID in the payload
  };

  if (USE_MOCK_API) {
    const mockResponse = {
      report: `Follow-up EDD Report for ${pep_name}:
      
- **Session ID:** ${session_id}
- **Client ID:** ${client_id}
- **User Message:** "${user_message}"
- **UID:** ${UID}

*This is a mock follow-up report generated for testing purposes.*`,
    };
    console.log("Mock API response for followup:", mockResponse);
    return res.status(200).json(mockResponse);
  } else {
    try {
      const headers = await getAuthHeaders(process.env.AIGISLLM_BACKEND_URL);
      const response = await axios.post(
        `${process.env.AIGISLLM_BACKEND_URL}/report`,
        payload,
        {
          headers,
          timeout: 900000, // 15 minutes
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
        error: error.response?.data || "Internal Server Error",
      });
    }
  }
});

module.exports = router;
