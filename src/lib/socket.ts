import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  // Fix #17: Guard against SSR — socket.io-client requires browser APIs
  if (typeof window === "undefined") {
    throw new Error("getSocket() cannot be called during SSR");
  }

  if (!socket) {
    const url = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";
    socket = io(`${url}/chat`, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
