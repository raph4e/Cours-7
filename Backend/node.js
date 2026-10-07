const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log('Client connecté. Total:', wss.clients.size);

  ws.on('message', (data) => {
    const message = data.toString();
    console.log('Message reçu:', message);

    // Diffuse le message à tous les clients connectés
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(message);
      }
    });
  });

  ws.on('close', () => {
    console.log('Client déconnecté. Total:', wss.clients.size);
  });
});

console.log('Serveur WebSocket démarré sur ws://localhost:8080');
