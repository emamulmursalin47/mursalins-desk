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

export interface ChatMessage {
  id: string;
  sender: "VISITOR" | "AI" | "ADMIN";
  content: string;
  createdAt: string;
}

interface ChatContextValue {
  isOpen: boolean;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  messages: ChatMessage[];
  sendMessage: (content: string) => void;
  sendVisitorInfo: (name: string, email: string) => void;
  requestHuman: () => void;
  isConnected: boolean;
  isTyping: boolean;
  typingSender: string | null;
  mode: "AI" | "LIVE";
  hasUnread: boolean;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("chat_session_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("chat_session_id", id);
  }
  return id;
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingSender, setTypingSender] = useState<string | null>(null);
  const [mode, setMode] = useState<"AI" | "LIVE">("AI");
  const [hasUnread, setHasUnread] = useState(false);
  const hasConnected = useRef(false);
  const isOpenRef = useRef(isOpen);

  // Keep ref in sync
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  const connectAndStart = useCallback(() => {
    if (hasConnected.current) return;
    hasConnected.current = true;

    const socket = getSocket();
    const sessionId = getSessionId();

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("chat:start", { sessionId });
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
        // Avoid duplicates
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });

      // If panel is closed and it's not from the visitor, mark unread
      if (!isOpenRef.current && msg.sender !== "VISITOR") {
        setHasUnread(true);
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
        // Add system message
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
      // Could show a toast, for now just log
      console.warn("Chat error:", data.message);
    });

    socket.connect();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
      hasConnected.current = false;
    };
  }, []);

  const openChat = useCallback(() => {
    setIsOpen(true);
    setHasUnread(false);
    connectAndStart();
  }, [connectAndStart]);

  const closeChat = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleChat = useCallback(() => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  }, [isOpen, openChat, closeChat]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      const socket = getSocket();
      const sessionId = getSessionId();
      socket.emit("chat:message", { sessionId, content: content.trim() });
    },
    [],
  );

  const sendVisitorInfo = useCallback((name: string, email: string) => {
    const socket = getSocket();
    const sessionId = getSessionId();
    socket.emit("chat:visitor_info", { sessionId, name, email });
  }, []);

  const requestHuman = useCallback(() => {
    sendMessage("I'd like to talk to a human please");
  }, [sendMessage]);

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        toggleChat,
        openChat,
        closeChat,
        messages,
        sendMessage,
        sendVisitorInfo,
        requestHuman,
        isConnected,
        isTyping,
        typingSender,
        mode,
        hasUnread,
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
