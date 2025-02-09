// aml-backend/auth.js
const { GoogleAuth } = require('google-auth-library');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

/**
 * Generates authentication headers with an ID token for the specified target URL.
 *
 * @param {string} targetUrl - The URL of the Cloud Run service you're accessing.
 * @returns {Object} - An object containing the Authorization header with the ID token.
 */
const getAuthHeaders = async (targetUrl) => {
  try {
    // Initialize GoogleAuth with the service account key file
    const auth = new GoogleAuth({
      keyFile: path.resolve(__dirname, process.env.SERVICE_ACCOUNT_FILE),
      // Do NOT specify scopes when obtaining an ID token
    });

    // Get the ID Token client for the specified target URL (audience)
    const client = await auth.getIdTokenClient(targetUrl);

    // Fetch the ID token and construct the Authorization header
    const headers = await client.getRequestHeaders();

    return {
      ...headers, // This includes the "Authorization: Bearer <id_token>"
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
  } catch (error) {
    console.error("Error obtaining auth headers:", error);
    throw error;
  }
};

module.exports = { getAuthHeaders };
