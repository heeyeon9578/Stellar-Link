import { io, Socket } from "socket.io-client";
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SITE_URL ||  "http://localhost:3000";
const socket: Socket = io(SOCKET_SERVER_URL, {
  path: "/api/socket",
});

export default socket;