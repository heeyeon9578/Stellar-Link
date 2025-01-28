import { io, Socket } from "socket.io-client";
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || window.location.origin;
const socket: Socket = io(SOCKET_SERVER_URL, {
  path: "/api/socket",
});

export default socket;