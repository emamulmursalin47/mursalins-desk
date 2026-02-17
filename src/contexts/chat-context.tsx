"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { playNotificationSound } from "@/lib/notification-sound";

export interface ChatMessage {
  id: string;
  sender: "VISITOR" | "AI" | "ADMIN";
  content: string;
  createdAt: string;
}

export interface NotificationPopup {
  message: string;
  sender: string;
}

interface ChatContextValue {
  isOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  resetChat: () => void;
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  sendVisitorInfo: (name: string, email: string) => void;
  requestHuman: () => void;
  isConnected: boolean;
  isTyping: boolean;
  typingSender: string | null;
  mode: "AI" | "LIVE";
  hasUnread: boolean;
  notification: NotificationPopup | null;
  dismissNotification: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingSender, setTypingSender] = useState<string | null>(null);
  const [mode, setMode] = useState<"AI" | "LIVE">("AI");
  const [hasUnread, setHasUnread] = useState(false);
  const [notification, setNotification] = useState<NotificationPopup | null>(
    null,
  );
  const hasStarted = useRef(false);
  const isOpenRef = useRef(isOpen);

  // Fresh session ID per page load — no localStorage persistence
  const sessionIdRef = useRef(
    typeof window !== "undefined" ? crypto.randomUUID() : "",
  );

  // Keep ref in sync
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  // Connect socket eagerly on mount
  useEffect(() => {
    const socket = getSocket();

    socket.on("connect", () => {
      setIsConnected(true);
      // On reconnect, rejoin room if chat was already started
      if (hasStarted.current) {
        socket.emit("chat:start", { sessionId: sessionIdRef.current });
      }
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on(
      "chat:started",
      (data: {
        conversationId: string;
        mode: "AI" | "LIVE";
        messages: ChatMessage[];
      }) => {
        setMode(data.mode);
        setMessages(data.messages);
      },
    );

    socket.on("chat:message", (msg: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // Notification popup + sound when panel is closed and message is from AI/Admin
      if (!isOpenRef.current && msg.sender !== "VISITOR") {
        setHasUnread(true);
        setNotification({ message: msg.content, sender: msg.sender });
        playNotificationSound();
      }
    });

    socket.on(
      "chat:typing",
      (data: { isTyping: boolean; sender: string }) => {
        setIsTyping(data.isTyping);
        setTypingSender(data.isTyping ? data.sender : null);
      },
    );

    socket.on(
      "chat:mode_changed",
      (data: { mode: "AI" | "LIVE"; message: string }) => {
        setMode(data.mode);
        setMessages((prev) => [
          ...prev,
          {
            id: `system_${Date.now()}`,
            sender: "AI" as const,
            content: data.message,
            createdAt: new Date().toISOString(),
          },
        ]);
      },
    );

    socket.on("chat:closed", (data: { message: string }) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `system_${Date.now()}`,
          sender: "AI" as const,
          content: data.message,
          createdAt: new Date().toISOString(),
        },
      ]);
    });

    socket.on("chat:error", (data: { message: string }) => {
      console.warn("Chat error:", data.message);
    });

    socket.connect();

    return () => {
      disconnectSocket();
      hasStarted.current = false;
    };
  }, []);

  // Start chat session — only on first open
  const startChat = useCallback(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("chat:start", { sessionId: sessionIdRef.current });
    }
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);
    setNotification(null);
    startChat();
  }, [startChat]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Reset: new session, clear messages, re-greet
  const resetChat = useCallback(() => {
    sessionIdRef.current = crypto.randomUUID();
    hasStarted.current = false;
    setMessages([]);
    setMode("AI");
    setIsTyping(false);
    setTypingSender(null);

    // Start a fresh conversation immediately
    hasStarted.current = true;
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("chat:start", { sessionId: sessionIdRef.current });
    }
  }, []);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [isOpen, openChat, closeChat]);

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    const socket = getSocket();
    socket.emit("chat:message", {
      sessionId: sessionIdRef.current,
      content: content.trim(),
    });
  }, []);

  const sendVisitorInfo = useCallback((name: string, email: string) => {
    const socket = getSocket();
    socket.emit("chat:visitor_info", {
      sessionId: sessionIdRef.current,
      name,
      email,
    });
  }, []);

  const requestHuman = useCallback(() => {
    sendMessage("I'd like to talk to a human please");
  }, [sendMessage]);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        toggleChat,
        openChat,
        closeChat,
        resetChat,
        messages,
        sendMessage,
        sendVisitorInfo,
        requestHuman,
        isConnected,
        isTyping,
        typingSender,
        mode,
        hasUnread,
        notification,
        dismissNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return ctx;
}
