export class ChatService {
  constructor(token) {
    this.token = token;
    this.socket = null;
    this.onMessageCallback = null;
  }

  connect(receiverId, callbacks = {}) {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const backendHost =
      import.meta.env.VITE_APP_API_URL?.replace("http://", "")
        .replace("https://", "")
        .replace("/api/", "") || "localhost:8000";

    const wsUrl = `${protocol}//${backendHost}/ws/chat/${receiverId}/?token=${this.token}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("✅ Chat connected");
      callbacks.onConnect?.();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message" && this.onMessageCallback) {
          this.onMessageCallback(data.data);
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    this.socket.onclose = () => {
      console.log("🔌 Chat disconnected");
      callbacks.onDisconnect?.();
    };

    this.socket.onerror = (error) => {
      console.error("❌ Chat WebSocket error:", error);
      callbacks.onError?.(error);
    };

    return this;
  }

  sendMessage(content) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ content }));
      return true;
    }
    return false;
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  onMessage(callback) {
    this.onMessageCallback = callback;
    return this;
  }

  static async fetchMessages(receiverId, token) {
    const API_URL =
      import.meta.env.VITE_APP_API_URL || "http://localhost:8000/api/";
    try {
      const response = await fetch(`${API_URL}chat/messages/${receiverId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        if (response.status === 404) return [];
        return [];
      }

      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error("Failed to fetch messages:", error);
      return [];
    }
  }
}
