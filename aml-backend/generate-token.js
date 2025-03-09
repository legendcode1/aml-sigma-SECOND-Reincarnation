const { GoogleAuth } = require('google-auth-library');
const path = require('path');

async function getIdToken() {
  const auth = new GoogleAuth({
    keyFile: path.resolve(__dirname, 'credentials/service-account.json'),
    scopes: [], // No scopes needed for ID token
  });
  const targetAudience = 'https://aegisllm-backend-633765957616.asia-southeast1.run.app';
  const client = await auth.getIdTokenClient(targetAudience);
  const token = await client.idTokenProvider.fetchIdToken(targetAudience);
  console.log('ID Token:', token);
  return token;
}

getIdToken().catch((error) => {
  console.error('Error generating token:', error);
});