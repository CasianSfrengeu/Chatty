// src/components/Conversations/Conversations.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const Conversations = ({ currentUserId, setSelectedConversation, refresh }) => {
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`/conversations/${currentUserId}`, {
          withCredentials: true,
        });
  
        // Optional: Fetch username-ul celuilalt user
        const withNames = await Promise.all(
          res.data.map(async (conv) => {
            const otherUserId = conv.members.find((id) => id !== currentUserId);
            const userRes = await axios.get(`/users/find/${otherUserId}`);
            return { ...conv, otherUsername: userRes.data.username };
          })
        );
  
        setConversations(withNames);
      } catch (err) {
        console.error("Eroare la aducerea conversațiilor", err);
      }
    };
  
    fetchConversations();
  }, [currentUserId, refresh]); // 👈 AICI TREBUIE să fie și refresh!
  

  return (
    <div className="p-4 space-y-2">
      <h2 className="text-xl font-bold text-orange-500 mb-4">Conversații</h2>
          {conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => setSelectedConversation(conv)}
              className="p-3 bg-white rounded-lg shadow cursor-pointer hover:bg-orange-100 transition"
            >
              {conv.otherUsername || "Conversație"}
            </div>
    ))}

    </div>
  );
};

export default Conversations;
