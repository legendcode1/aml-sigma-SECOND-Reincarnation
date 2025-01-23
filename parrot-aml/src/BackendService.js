import express from 'express';
import { GoogleAuth } from 'google-auth-library';
import cors from 'cors';
import axios from 'axios';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Path to your service account key file
const SERVICE_ACCOUNT_FILE = 'path/to/your/service-account-file.json';

// Target URL for authentication (your Cloud Run backend)
const TARGET_URL = 'https://aegisllm-backend-633765957616.asia-southeast1.run.app';

async function getAuthHeaders() {
  try {
    const auth = new GoogleAuth({
      keyFile: SERVICE_ACCOUNT_FILE,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getIdTokenClient(TARGET_URL);
    const tokenResponse = await client.getRequestHeaders();
    return {
      ...tokenResponse,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  } catch (error) {
    console.error('Error generating auth headers:', error);
    throw error;
  }
}

app.post('/api/report', async (req, res) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${TARGET_URL}/report`, req.body, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('Error making authenticated request:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});