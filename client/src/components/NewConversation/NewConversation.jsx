import React, { useState } from "react";
import api from "../../api";

const NewConversation = ({ currentUserId, onConversationCreated }) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleCreateConversation = async (e) => {
    e.preventDefault();

    if (!usernameInput.trim()) {
      setFeedback("Introduceți un nume de utilizator.");
      return;
    }

    try {
      // Pasul 1: Caută userul după username
      const resUser = await api.get(`/users/username/${usernameInput}`);
      const receiver = resUser.data;

      if (receiver._id === currentUserId) {
        setFeedback("Nu poți începe o conversație cu tine.");
        return;
      }

      // Pasul 2: Verifică dacă există deja o conversație
      const resConv = await api.get(`/conversations/${currentUserId}`);
      const conversations = Array.isArray(resConv.data) ? resConv.data : [];
      const alreadyExists = conversations.some((conv) =>
        conv.members.includes(receiver._id)
      );

      if (alreadyExists) {
        setFeedback("Conversația deja există.");
        return;
      }

      // ✅ Pasul 3: Creează conversația
      await api.post("/conversations", {
        senderId: currentUserId,
        receiverId: receiver._id,
      });

      // 👇 Mutat AICI pentru a forța refreshul conversațiilor
      if (onConversationCreated) onConversationCreated();

      setFeedback("Conversația a fost creată!");
      setUsernameInput("");

    } catch (err) {
      console.log("Eroare:", err);
      setFeedback("Utilizatorul nu a fost găsit sau a apărut o eroare.");
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-orange-600 mb-3">
        New Conversation
      </h3>
      <form onSubmit={handleCreateConversation} className="space-y-3">
        <input
          type="text"
          placeholder="Enter username..."
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          className="w-full p-2 border border-orange-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition"
        >
          Start Conversation
        </button>
      </form>
      {feedback && (
        <p className="mt-2 text-sm text-orange-600">{feedback}</p>
      )}
    </div>
  );
};

export default NewConversation;
