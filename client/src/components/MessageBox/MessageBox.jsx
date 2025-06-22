import React, { useEffect, useState, useRef } from "react";
import api from "../../api";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import formatDistance from "date-fns/formatDistance";

const socket = io(window.location.origin);

const MessageBox = ({ conversation }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverUsername, setReceiverUsername] = useState("");
  const [typingStatus, setTypingStatus] = useState(null);
  const scrollRef = useRef(null);

  const otherUserId = conversation?.members?.find(
    (id) => id !== currentUser._id
  );

  // 🔌 Conectare socket
  useEffect(() => {
    socket.emit("addUser", currentUser._id);
  }, [currentUser]);

  // 📩 Mesaj primit
  useEffect(() => {
    const handleReceive = (data) => {
      if (data.conversationId === conversation?._id) {
        setMessages((prev) => {
          const exists = prev.some(
            (m) =>
              m.text === data.text &&
              m.sender === data.sender &&
              new Date(m.createdAt).getTime() === new Date(data.createdAt).getTime()
          );
          return exists ? prev : [...prev, data];
        });
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => socket.off("receiveMessage", handleReceive);
  }, [conversation]);

  // 🟠 Tastează
  useEffect(() => {
    socket.on("typing", ({ senderName, conversationId }) => {
      if (conversationId === conversation?._id) {
        setTypingStatus(`${senderName} tastează...`);

        // Șterge indicatorul după 2 secunde
        const timeout = setTimeout(() => setTypingStatus(null), 2000);
        return () => clearTimeout(timeout);
      }
    });

    return () => socket.off("typing");
  }, [conversation]);

  // 📥 Fetch mesaje
  useEffect(() => {
    if (!conversation?._id) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${conversation._id}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log("Eroare la fetch messages:", err);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [conversation]);

  // 📛 Username partener
  useEffect(() => {
    if (!otherUserId) return;
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/find/${otherUserId}`);
        setReceiverUsername(res.data?.username || "Utilizator");
      } catch (err) {
        console.log("Eroare la fetch user:", err);
        setReceiverUsername("Utilizator");
      }
    };
    fetchUser();
  }, [otherUserId]);

  // 🔽 Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✉️ Trimitere mesaj
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sender: currentUser._id,
      text: newMessage,
      conversationId: conversation._id,
      createdAt: new Date().toISOString(),
    };

    try {
      setMessages((prev) => [...prev, message]);
      setNewMessage("");

      await api.post("/messages", message);

      socket.emit("sendMessage", {
        ...message,
        receiverId: otherUserId,
      });
    } catch (err) {
      console.log("Eroare la trimitere mesaj:", err);
    }
  };

  // 📤 Emitere typing la input
  const handleTyping = () => {
    socket.emit("typing", {
      senderName: currentUser.username,
      conversationId: conversation._id,
      receiverId: otherUserId,
    });
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Selectează o conversație pentru a începe chatul.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="pb-4 border-b border-orange-300 mb-2">
        <h3 className="text-xl font-semibold text-orange-500">
          Chat cu: {receiverUsername || "Utilizator"}
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 px-2 bg-orange-50">
        {Array.isArray(messages) && messages.map((msg, index) => (
          <div
            key={index}
            ref={scrollRef}
            className={`max-w-[70%] p-3 rounded-xl text-sm shadow ${
              msg.sender === currentUser._id
                ? "bg-orange-200 self-end text-right"
                : "bg-white self-start text-left border border-orange-200"
            }`}
          >
            <p>{msg.text}</p>
            <span className="text-[10px] text-gray-500 block mt-1">
              {formatDistance(new Date(msg.createdAt), new Date(), {
                addSuffix: true,
              })}
            </span>
          </div>
        ))}

        {/* ➕ Indicator tastează */}
        {typingStatus && (
          <div className="text-sm text-gray-400 italic">{typingStatus}</div>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex mt-4 border-t border-orange-300 pt-2 px-2"
      >
        <input
          type="text"
          placeholder="Scrie un mesaj..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          className="flex-1 px-4 py-2 border border-orange-300 rounded-l-full focus:outline-none"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-6 rounded-r-full hover:bg-orange-600 transition"
        >
          Trimite
        </button>
      </form>
    </div>
  );
};

export default MessageBox;
