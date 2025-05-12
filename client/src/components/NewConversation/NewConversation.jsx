import React, { useState } from "react";
import axios from "axios";

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
      const resUser = await axios.get(`/users/username/${usernameInput}`);
      const receiver = resUser.data;

      if (receiver._id === currentUserId) {
        setFeedback("Nu poți începe o conversație cu tine.");
        return;
      }

      // Pasul 2: Verifică dacă există deja o conversație
      const resConv = await axios.get(`/conversations/${currentUserId}`);
      const alreadyExists = resConv.data.some((conv) =>
        conv.members.includes(receiver._id)
      );

      if (alreadyExists) {
        setFeedback("Conversația deja există.");
        return;
      }

      // ✅ Pasul 3: Creează conversația
      await axios.post("/conversations", {
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
    <div className="p-4 bg-orange-50 rounded-lg shadow space-y-4 mt-4">
      <h3 className="text-lg font-semibold text-orange-500">
        Începe o conversație nouă
      </h3>
      <form onSubmit={handleCreateConversation} className="flex space-x-2">
        <input
          type="text"
          placeholder="Username"
          value={usernameInput}
          onChange={(e) => setUsernameInput(e.target.value)}
          className="flex-1 px-3 py-2 border border-orange-300 rounded focus:outline-none"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
        >
          Creează
        </button>
      </form>
      {feedback && <p className="text-sm text-gray-600">{feedback}</p>}
    </div>
  );
};

export default NewConversation;
