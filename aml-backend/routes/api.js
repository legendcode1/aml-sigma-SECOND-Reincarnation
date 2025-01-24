// aml-backend/routes/api.js

const express = require('express');
const axios = require('axios');
const { getAuthHeaders } = require('../auth');

const router = express.Router();

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

  try {
    const headers = await getAuthHeaders(process.env.AIGISLLM_BACKEND_URL);
    console.log("Auth headers obtained:", headers);

    const response = await axios.post(
      `${process.env.AIGISLLM_BACKEND_URL}/report`,
      payload,
      { headers }
    );

    console.log("External API response:", response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in /report:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal Server Error',
    });
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

  try {
    const headers = await getAuthHeaders(process.env.AIGISLLM_BACKEND_URL);
    console.log("Auth headers obtained:", headers);

    const response = await axios.post(
      `${process.env.AIGISLLM_BACKEND_URL}/followup`,
      payload,
      {
        headers,
        params: { client_id },
      }
    );

    console.log("External API response:", response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error in /followup:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || 'Internal Server Error',
    });
  }
});

module.exports = router;
