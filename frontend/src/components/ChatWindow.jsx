import { useAuth } from "../context/AuthContext";
import { ChatService } from "../services/chat";
import { Send, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";

const ChatWindow = ({ receiver, onClose }) => {
  const { user, getToken } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      if (!receiver?.id) return;
      try {
        const token = getToken();
        if (!token) return;
        const data = await ChatService.fetchMessages(receiver.id, token);
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      }
    };
    load();
  }, [receiver?.id, getToken]);

  useEffect(() => {
    const token = getToken();
    if (!token || !receiver?.id) return;

    let reconnectTimeout;
    let retries = 0;
    const MAX_RETRIES = 5;
    let cancelled = false;

    const connect = () => {
      if (cancelled) return;

      const service = new ChatService(token);
      chatRef.current = service
        .connect(receiver.id, {
          onConnect: () => {
            if (cancelled) {
              service.disconnect();
              return;
            }
            retries = 0;
          },
          onError: () => {
            if (cancelled) return;
            retries++;
            if (retries < MAX_RETRIES) {
              reconnectTimeout = setTimeout(connect, 3000 * retries);
            }
          },
          onDisconnect: () => {},
        })
        .onMessage((msg) => {
          if (cancelled) return;
          setMessages((prev) => {
            if (msg.sender?.id === user?.id) {
              const pendingIndex = prev.findIndex(
                (m) => m.pending && m.content === msg.content,
              );
              if (pendingIndex !== -1) {
                const updated = [...prev];
                updated[pendingIndex] = msg;
                return updated;
              }
            }
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        });
    };

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimeout);
      retries = MAX_RETRIES;
      const socket = chatRef.current?.socket;
      if (socket) {
        if (socket.readyState === WebSocket.CONNECTING) {
          socket.onopen = () => socket.close();
          socket.onerror = () => {};
        } else {
          chatRef.current.disconnect();
        }
      }
    };
  }, [receiver?.id, getToken, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const tempId = `temp_${Date.now()}`;
    const sent = chatRef.current?.sendMessage(text);

    if (sent) {
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          content: text,
          sender: { id: user?.id, username: user?.username },
          created_at: new Date().toISOString(),
          pending: true,
        },
      ]);
      setText("");
    }
  };

  const getInitial = (name) => name?.charAt?.(0)?.toUpperCase() || "?";

  return (
    <div className="fixed inset-0 md:bottom-20 md:right-4 md:left-auto md:top-auto md:w-80 md:h-112.5 bg-white z-50 flex flex-col shadow-xl md:rounded-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b bg-white">
        <button onClick={onClose} className="md:hidden">
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-gray-300 flex items-center justify-center overflow-hidden">
          {receiver?.profile?.profile_picture ? (
            <img
              src={receiver.profile.profile_picture}
              alt={receiver.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-semibold text-gray-600">
              {getInitial(receiver?.username)}
            </span>
          )}
        </div>
        <div>
          <p className="font-medium text-sm">
            {receiver?.username || "Unknown"}
          </p>
          <p className="text-xs text-green-500">● Active</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
        {messages.map((m) => {
          const isOwn = m.sender?.id === user?.id;
          return (
            <div
              key={m.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-3 py-2 rounded-2xl text-sm max-w-[70%] ${
                  isOwn
                    ? "bg-blue-500 text-white"
                    : "bg-white border text-gray-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} className="p-2 border-t flex gap-2 bg-white">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message..."
          className="flex-1 px-3 py-2 rounded-full border text-sm outline-none"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
