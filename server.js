const fs = require('fs');
const WebSocket = require('ws');


// const https = require('https');

// const server = https.createServer({
//   key: fs.readFileSync('/etc/letsencrypt/live/api.recarrega.app.br/privkey.pem'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/api.recarrega.app.br/fullchain.pem')
// });

const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('WebSocket server is running');
});
const wss = new WebSocket.Server({ server });

const AUTH_KEY = '4a7b9c2e-f1d8-4f96-8b39-7c31e18c5a23'; // Substitua pela sua chave de autenticação

// Mantenha uma lista de IDs de usuários conectados
const connectedUsers = new Set();

wss.on('connection', (ws, request) => {
  const url = new URL(request.url, 'http://localhost');
  const authKey = url.searchParams.get('authKey');
  const userId = url.searchParams.get('userId');

  console.log(authKey);
  if (authKey === AUTH_KEY) {
    console.log(`User with userId ${userId} connected with valid auth key`);

    // Adicione o usuário à lista de usuários conectados
    connectedUsers.add(userId);

    // sendConnectedUsersList(wss, connectedUsers);

    ws.on('message', (message) => {
      try {
        const messageObj = JSON.parse(message);
        console.log('Received message:', messageObj);

        // Enviar a mensagem de volta para todos os clientes conectados
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            console.log("enviando mensagem");
            console.log(messageObj)
            client.send(messageObj);
          }
        });
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    });

    ws.on('close', () => {
      console.log(`User with userId ${userId} disconnected`);

      // connectedUsers.delete(userId);

      // sendConnectedUsersList(wss, connectedUsers);
    });
  } else {
    console.log('Unauthorized connection attempt');
    ws.close(); // Feche a conexão não autorizada
  }
});

// Quando a lista de usuários online for atualizada, envie uma mensagem para todos os clientes
function sendConnectedUsersList(wss, userList) {
  const message = {
    type: 'updateUserList',
    users: Array.from(userList)
  };

  // Envie a mensagem para todos os clientes conectados
  wss.clients.forEach(client => {
    if (client.readyState == WebSocket.OPEN) {
      // client.send(JSON.stringify(message));

      // console.log(message)
    }
  });
}

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`WebSocket server listening on port ${PORT}`);
});
