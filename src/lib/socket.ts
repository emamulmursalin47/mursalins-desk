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
      reconnection: true,        // Auto-reconnect on drop
      reconnectionAttempts: 10,  // Try 10 times before giving up
      reconnectionDelay: 1000,   // Start at 1s
      reconnectionDelayMax: 10000, // Cap at 10s
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
