"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import {
  playNotificationSound,
  primeAudio,
  isAudioReady,
} from "@/lib/notification-sound";

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

export interface ConversationHistoryEntry {
  sessionId: string;
  preview: string;
  date: string;
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
  isAdminOnline: boolean;
  notification: NotificationPopup | null;
  dismissNotification: () => void;
  visitorInfo: { name: string; email: string } | null;
  showLeadForm: boolean;
  leadFormMode: "escalation" | "soft";
  submitLeadForm: (name: string, email: string, question?: string) => void;
  dismissLeadForm: () => void;
  conversationHistory: ConversationHistoryEntry[];
  showHistory: boolean;
  setShowHistory: (v: boolean) => void;
  loadConversation: (sessionId: string) => void;
  deleteConversationHistory: (sessionId: string) => void;
}

const HISTORY_KEY = "chat_session_history";
const CURRENT_SESSION_KEY = "chat_current_session";

function loadHistory(): ConversationHistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: ConversationHistoryEntry[]) {
  try {
    // Keep last 20 conversations max
    localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, 20)));
  } catch {
    // Storage unavailable
  }
}

function loadCurrentSession(): string | null {
  try {
    return localStorage.getItem(CURRENT_SESSION_KEY);
  } catch {
    return null;
  }
}

function saveCurrentSession(sessionId: string) {
  try {
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
  } catch {
    // Storage unavailable
  }
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
  const [visitorInfo, setVisitorInfo] = useState<{
    name: string;
    email: string;
  } | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormMode, setLeadFormMode] = useState<"escalation" | "soft">(
    "escalation",
  );
  const [softPromptDismissed, setSoftPromptDismissed] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<
    ConversationHistoryEntry[]
  >([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAdminOnline, setIsAdminOnline] = useState(false);

  const hasStarted = useRef(false);
  const isOpenRef = useRef(isOpen);

  // Resume previous session or create fresh one
  const sessionIdRef = useRef(
    typeof window !== "undefined"
      ? loadCurrentSession() || crypto.randomUUID()
      : "",
  );

  // Persist the current session id on init
  useEffect(() => {
    if (sessionIdRef.current) {
      saveCurrentSession(sessionIdRef.current);
    }
  }, []);

  // Derived: count visitor messages
  const visitorMessageCount = useMemo(
    () => messages.filter((m) => m.sender === "VISITOR").length,
    [messages],
  );

  // Hydrate visitor info from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("chat_visitor_info");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name && parsed.email) {
          setVisitorInfo(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Hydrate conversation history from localStorage
  useEffect(() => {
    setConversationHistory(loadHistory());
  }, []);

  // Soft prompt trigger: after 5 visitor messages without info
  useEffect(() => {
    if (
      visitorMessageCount >= 5 &&
      !visitorInfo &&
      !softPromptDismissed &&
      !showLeadForm
    ) {
      setLeadFormMode("soft");
      setShowLeadForm(true);
    }
  }, [visitorMessageCount, visitorInfo, softPromptDismissed, showLeadForm]);

  // Keep ref in sync
  useEffect(() => {
    isOpenRef.current = isOpen;
    if (isOpen) setHasUnread(false);
  }, [isOpen]);

  // Prime audio on first valid user gesture, then remove listeners
  useEffect(() => {
    const unlock = () => {
      primeAudio();
      // Remove all listeners once audio is unlocked
      if (isAudioReady()) {
        document.removeEventListener("click", unlock);
        document.removeEventListener("touchstart", unlock);
        document.removeEventListener("keydown", unlock);
      }
    };
    document.addEventListener("click", unlock);
    document.addEventListener("touchstart", unlock);
    document.addEventListener("keydown", unlock);
    return () => {
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  // Helper: save current session to history
  const saveCurrentToHistory = useCallback(() => {
    const currentId = sessionIdRef.current;
    if (!currentId) return;

    // Get a preview from the last visitor message
    const lastVisitorMsg = [...messages]
      .reverse()
      .find((m) => m.sender === "VISITOR");
    const preview = lastVisitorMsg
      ? lastVisitorMsg.content.slice(0, 80)
      : "New conversation";

    // Only save if there were actual messages
    if (messages.length === 0) return;

    setConversationHistory((prev) => {
      const filtered = prev.filter((e) => e.sessionId !== currentId);
      const updated = [
        { sessionId: currentId, preview, date: new Date().toISOString() },
        ...filtered,
      ];
      saveHistory(updated);
      return updated;
    });
  }, [messages]);

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

        // Update history preview for this session
        if (data.messages.length > 0) {
          const lastVisitorMsg = [...data.messages]
            .reverse()
            .find((m) => m.sender === "VISITOR");
          if (lastVisitorMsg) {
            setConversationHistory((prev) => {
              const idx = prev.findIndex(
                (e) => e.sessionId === sessionIdRef.current,
              );
              if (idx === -1) return prev;
              const updated = [...prev];
              const entry = updated[idx]!;
              updated[idx] = {
                ...entry,
                preview: lastVisitorMsg.content.slice(0, 80),
              };
              saveHistory(updated);
              return updated;
            });
          }
        }

        // If the greeting arrived while panel is closed, show popup + sound
        if (!isOpenRef.current && data.messages.length > 0) {
          const lastMsg = data.messages.at(-1);
          if (lastMsg && lastMsg.sender !== "VISITOR") {
            setHasUnread(true);
            setNotification({
              message: lastMsg.content,
              sender: lastMsg.sender,
            });
            playNotificationSound();
          }
        }
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

    socket.on("chat:admin_status", (data: { isOnline: boolean }) => {
      setIsAdminOnline(data.isOnline);
    });

    socket.connect();

    // Proactive greeting: start chat in background after 10s if visitor hasn't opened it
    const proactiveTimer = setTimeout(() => {
      if (!hasStarted.current) {
        hasStarted.current = true;
        const s = getSocket();
        if (s.connected) {
          s.emit("chat:start", { sessionId: sessionIdRef.current });
        }
      }
    }, 10_000);

    return () => {
      clearTimeout(proactiveTimer);
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

  // Reset: save current to history, new session, clear messages, re-greet
  const resetChat = useCallback(() => {
    saveCurrentToHistory();

    sessionIdRef.current = crypto.randomUUID();
    saveCurrentSession(sessionIdRef.current);
    hasStarted.current = false;
    setMessages([]);
    setMode("AI");
    setIsTyping(false);
    setTypingSender(null);
    setShowLeadForm(false);
    setSoftPromptDismissed(false);
    setShowHistory(false);

    // Start a fresh conversation immediately
    hasStarted.current = true;
    const socket = getSocket();
    if (socket.connected) {
      socket.emit("chat:start", { sessionId: sessionIdRef.current });
    }
  }, [saveCurrentToHistory]);

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
    if (visitorInfo) {
      sendVisitorInfo(visitorInfo.name, visitorInfo.email);
      sendMessage(
        isAdminOnline
          ? "I'd like to talk to a human please"
          : "I'd like to leave a message for Mursalin",
      );
    } else {
      setLeadFormMode("escalation");
      setShowLeadForm(true);
    }
  }, [visitorInfo, sendVisitorInfo, sendMessage, isAdminOnline]);

  const submitLeadForm = useCallback(
    (name: string, email: string, question?: string) => {
      const info = { name, email };
      setVisitorInfo(info);
      sendVisitorInfo(name, email);
      setShowLeadForm(false);
      setSoftPromptDismissed(true);

      // Persist to localStorage
      try {
        localStorage.setItem("chat_visitor_info", JSON.stringify(info));
      } catch {
        // Storage unavailable
      }

      if (leadFormMode === "escalation") {
        if (question?.trim()) {
          sendMessage(question.trim());
        }
        sendMessage(
          isAdminOnline
            ? "I'd like to talk to a human please"
            : "I'd like to leave a message for Mursalin",
        );
      } else {
        // Soft mode: inject a local thank-you message
        setMessages((prev) => [
          ...prev,
          {
            id: `local_thanks_${Date.now()}`,
            sender: "AI" as const,
            content: `Thanks, ${name}! I'll make sure Mursalin has your details. Feel free to continue asking questions.`,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    },
    [leadFormMode, sendVisitorInfo, sendMessage, isAdminOnline],
  );

  const dismissLeadForm = useCallback(() => {
    setShowLeadForm(false);
    if (leadFormMode === "soft") {
      setSoftPromptDismissed(true);
    }
  }, [leadFormMode]);

  const loadConversation = useCallback(
    (targetSessionId: string) => {
      // Save current conversation to history first
      saveCurrentToHistory();

      // Switch to the target session
      sessionIdRef.current = targetSessionId;
      saveCurrentSession(targetSessionId);
      hasStarted.current = false;
      setMessages([]);
      setMode("AI");
      setIsTyping(false);
      setTypingSender(null);
      setShowLeadForm(false);
      setSoftPromptDismissed(false);
      setShowHistory(false);

      // Start the session (loads existing messages from server)
      hasStarted.current = true;
      const socket = getSocket();
      if (socket.connected) {
        socket.emit("chat:start", { sessionId: targetSessionId });
      }
    },
    [saveCurrentToHistory],
  );

  const deleteConversationHistory = useCallback((targetSessionId: string) => {
    setConversationHistory((prev) => {
      const updated = prev.filter((e) => e.sessionId !== targetSessionId);
      saveHistory(updated);
      return updated;
    });
  }, []);

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
        isAdminOnline,
        notification,
        dismissNotification,
        visitorInfo,
        showLeadForm,
        leadFormMode,
        submitLeadForm,
        dismissLeadForm,
        conversationHistory,
        showHistory,
        setShowHistory,
        loadConversation,
        deleteConversationHistory,
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
