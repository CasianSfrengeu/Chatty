import React, { useEffect, useState } from "react";
import api from "../../api";

const ConversationList = ({ currentUserId, setSelectedConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [usernames, setUsernames] = useState({}); // Map { userId: username }

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        // ✅ Fix: ruta corectă include prefixul /api
        const res = await api.get(`/conversations/${currentUserId}`);
        const conversationsData = Array.isArray(res.data) ? res.data : [];
        setConversations(conversationsData);

        if (conversationsData.length > 0) {
          // Extragem ID-urile celorlalți useri
          const userIds = conversationsData.map((conv) =>
            conv.members.find((id) => id !== currentUserId)
          );

          const uniqueIds = [...new Set(userIds)];

          const usernameMap = {};
          await Promise.all(
            uniqueIds.map(async (id) => {
              try {
                const userRes = await api.get(`/users/find/${id}`);
                if (userRes.data && userRes.data.username) {
                  usernameMap[id] = userRes.data.username;
                }
              } catch (err) {
                console.log("Error fetching user:", err);
              }
            })
          );

          setUsernames(usernameMap);
        }
      } catch (err) {
        console.log("Eroare la fetch conversations:", err);
        setConversations([]);
      }
    };

    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  return (
    <div className="p-4 space-y-2">
      {Array.isArray(conversations) && conversations.length > 0 ? (
        conversations.map((conv) => {
          const otherUserId = conv.members.find((id) => id !== currentUserId);
          return (
            <div
              key={conv._id}
              onClick={() => setSelectedConversation(conv)}
              className="p-3 bg-white rounded-lg shadow cursor-pointer hover:bg-orange-100 transition"
            >
              {usernames[otherUserId] || "Conversație"}
            </div>
          );
        })
      ) : (
        <p className="text-gray-500 text-center py-4">
          No conversations yet. Start a new one!
        </p>
      )}
    </div>
  );
};

export default ConversationList;

