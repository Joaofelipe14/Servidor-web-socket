const WebSocket = require('ws');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running');
});

const wss = new WebSocket.Server({ server });

const AUTH_KEY = '4a7b9c2e-f1d8-4f96-8b39-7c31e18c5a23'; // Substitua pela sua chave de autenticação

wss.on('connection', (ws, request) => {
  const url = new URL(request.url, 'http://localhost');
  const authKey = url.searchParams.get('authKey');

  console.log(authKey);
  if (authKey === AUTH_KEY) {
    console.log('A new client connected with valid auth key');
    
    ws.on('message', (message) => {
      try {
        const messageObj = JSON.parse(message);
        console.log('Received message:', messageObj);

        // Enviar a mensagem de volta para todos os clientes conectados
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            console.log("enviando mensagem");
            client.send(messageObj); 
          }
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });

    ws.on('close', () => {
      console.log('Client disconnected');
    });
  } else {
    console.log('Unauthorized connection attempt');
    ws.close(); // Feche a conexão não autorizada
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
