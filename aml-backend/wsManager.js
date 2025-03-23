// wsManager.js
const wsConnections = {}; // { sessionId: { ws: WebSocket, ready: boolean } }

module.exports = {
  wsConnections,
};
