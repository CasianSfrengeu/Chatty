import React, { useEffect, useState } from "react";
import axios from "axios";

const ConversationList = ({ currentUserId, setSelectedConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [usernames, setUsernames] = useState({}); // Map { userId: username }

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // ✅ Fix: ruta corectă include prefixul /api
        const res = await axios.get(`/conversations/${currentUserId}`);
        setConversations(res.data);

        // Extragem ID-urile celorlalți useri
        const userIds = res.data.map((conv) =>
          conv.members.find((id) => id !== currentUserId)
        );

        const uniqueIds = [...new Set(userIds)];

        const usernameMap = {};
        await Promise.all(
          uniqueIds.map(async (id) => {
            const userRes = await axios.get(`/users/find/${id}`);
            usernameMap[id] = userRes.data.username;
          })
        );

        setUsernames(usernameMap);
      } catch (err) {
        console.log("Eroare la fetch conversations:", err);
      }
    };

    fetchConversations();
  }, [currentUserId]);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold text-orange-500 mb-4">Conversații</h2>
      {conversations.length > 0 ? (
        conversations.map((conv) => {
          const otherUserId = conv.members.find((id) => id !== currentUserId);
          return (
            <div
              key={conv._id}
              onClick={() => setSelectedConversation(conv)}
              className="p-3 bg-orange-50 rounded-lg shadow cursor-pointer hover:bg-orange-100 transition"
            >
              <p className="text-gray-700 font-medium truncate">
                Conversație cu: {usernames[otherUserId] || "..."}
              </p>
            </div>
          );
        })
      ) : (
        <p className="text-gray-500">Nu ai conversații active.</p>
      )}
    </div>
  );
};

export default ConversationList;

