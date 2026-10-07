const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.get('/', (req, res) => {
  res.send('Serveur HTTP + WebSocket actif');
});

// Écoute les événements de connexion des clients
wss.on('connection', (ws) => {
  console.log('Client connecté. Total:', wss.clients.size);

  // Marque le client comme vivant pour le mécanisme de ping/pong
  ws.isAlive = true;

  // Écoute les événements de "pong" pour maintenir la connexion active
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Écoute les messages entrants des clients
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

  // Écoute les événements de fermeture de connexion des clients, logge le nombre de clients restants
  ws.on('close', () => {
    console.log('Client déconnecté. Total:', wss.clients.size);
  });
});

// Ping les clients toutes les 30 secondes pour vérifier s'ils sont toujours connectés
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

// Nettoyage de l'intervalle lorsque le serveur WebSocket est fermé
wss.on('close', () => {
  clearInterval(interval);
});

// Démarre le serveur HTTP + WebSocket sur le port 8080
server.listen(8080, () => {
  console.log('Serveur HTTP + WebSocket démarré sur http://localhost:8080');
});
