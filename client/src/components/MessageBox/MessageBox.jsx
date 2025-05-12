import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import formatDistance from "date-fns/formatDistance";

const MessageBox = ({ conversation, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverUsername, setReceiverUsername] = useState("");
  const scrollRef = useRef(null);

  const otherUserId = conversation?.members?.find(
    (id) => id !== currentUser._id
  );

  // ✅ Fetch messages when conversation is selected
  useEffect(() => {
    if (!conversation?._id) return;

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`/messages/${conversation._id}`);
        setMessages(res.data);
      } catch (err) {
        console.log("Eroare la fetch messages:", err);
      }
    };

    fetchMessages();
  }, [conversation]);

  // ✅ Fetch other user data
  useEffect(() => {
    if (!otherUserId) return;

    const fetchUser = async () => {
      try {
        const res = await axios.get(`/users/find/${otherUserId}`);
        setReceiverUsername(res.data.username);
      } catch (err) {
        console.log("Eroare la fetch user:", err);
      }
    };

    fetchUser();
  }, [otherUserId]);

  // ✅ Scroll to latest message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message = {
      sender: currentUser._id,
      text: newMessage,
      conversationId: conversation._id,
    };

    try {
      const res = await axios.post("/messages", message);
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.log("Eroare la trimitere:", err);
    }
  };

  // ✅ Fallback dacă conversația nu este selectată
  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Selectează o conversație pentru a începe chatul.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="pb-4 border-b border-orange-300 mb-2">
        <h3 className="text-xl font-semibold text-orange-500">
          Chat cu: {receiverUsername || "Utilizator"}
        </h3>
      </div>

      {/* Mesaje */}
      <div className="flex-1 overflow-y-auto space-y-3 px-2 bg-orange-50">
        {messages.map((msg) => (
          <div
            key={msg._id}
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
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex mt-4 border-t border-orange-300 pt-2 px-2"
      >
        <input
          type="text"
          placeholder="Scrie un mesaj..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
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
