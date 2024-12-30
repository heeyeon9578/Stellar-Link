import { WebSocketServer } from 'ws';
import { connectDB } from "@/util/database";

let wsServer: WebSocketServer | null = null;

export default async function handler(req: any, res: any) {
  if (!res.socket.server.ws) {
    console.log('Initializing WebSocket server...');
    wsServer = new WebSocketServer({ server: res.socket.server });

    wsServer.on('connection', (socket) => {
      console.log('Client connected');

      socket.on('message', async (data: string) => {
        const message = JSON.parse(data);

        // MongoDB에 메시지 저장
        const db = (await connectDB).db('StellarLink');
        await db.collection('chat').insertOne({
          sessionId: message.sessionId,
          sender: message.sender,
          message: message.text,
          timestamp: new Date(),
        });

        // 모든 클라이언트에게 메시지 브로드캐스트
        wsServer?.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      });

      socket.on('close', () => {
        console.log('Client disconnected');
      });
    });

    res.socket.server.ws = wsServer;
  }

  res.end();
}