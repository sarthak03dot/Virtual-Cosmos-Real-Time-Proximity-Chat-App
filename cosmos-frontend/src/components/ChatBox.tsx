import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

const ChatBox = ({ roomId }: { roomId: string }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage = {
      sender: "me",
      message: message.trim(),
      timestamp: new Date().toISOString(),
    };

    socket.emit("send_message", {
      roomId,
      message: message.trim(),
    });

    setMessages((prev) => [...prev, newMessage]);
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Communication Link</h3>
        <div className="status-indicator">
          <div className="pulse-dot"></div>
          <span style={{ fontSize: '0.6rem', opacity: 0.6 }}>SECURE</span>
        </div>
      </div>

      <div className="message-list" ref={scrollRef}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.3, fontSize: '0.7rem', marginTop: '1rem' }}>
            // ENCRYPTED CHANNEL ESTABLISHED //
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`message-item ${msg.sender === "me" ? "me" : ""}`}>
            <span className="message-sender">
              {msg.sender === "me" ? "> YOU" : `> ${msg.sender.slice(0, 8)}`}
            </span>
            <div className="message-bubble">
              {msg.message}
            </div>
            <span className="message-timestamp">
              [{formatTime(msg.timestamp)}]
            </span>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <input
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command..."
          autoFocus
        />
        <button className="chat-send-btn" onClick={sendMessage}>
          SEND
        </button>
      </div>
    </div>
  );
};

export default ChatBox;