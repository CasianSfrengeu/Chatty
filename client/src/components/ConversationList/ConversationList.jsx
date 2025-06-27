import React, { useEffect, useState } from "react";
import api from "../../api";

const ConversationList = ({ currentUserId, setSelectedConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [userInfos, setUserInfos] = useState({}); // Map { userId: { username, profilePicture, biography } }
  const [lastMessages, setLastMessages] = useState({}); // Map { convId: lastMessage }

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get(`/conversations/${currentUserId}`);
        const conversationsData = Array.isArray(res.data) ? res.data : [];
        setConversations(conversationsData);

        if (conversationsData.length > 0) {
          // Get other user IDs
          const userIds = conversationsData.map((conv) =>
            conv.members.find((id) => id !== currentUserId)
          );
          const uniqueIds = [...new Set(userIds)];

          // Fetch user info for each
          const infoMap = {};
          await Promise.all(
            uniqueIds.map(async (id) => {
              try {
                const userRes = await api.get(`/users/find/${id}`);
                if (userRes.data && userRes.data.username) {
                  infoMap[id] = {
                    username: userRes.data.username,
                    profilePicture: userRes.data.profilePicture,
                    biography: userRes.data.biography,
                  };
                }
              } catch (err) {
                // fallback
                infoMap[id] = { username: "User", profilePicture: "", biography: "" };
              }
            })
          );
          setUserInfos(infoMap);

          // Fetch last message for each conversation
          const lastMsgMap = {};
          await Promise.all(
            conversationsData.map(async (conv) => {
              try {
                const msgsRes = await api.get(`/messages/${conv._id}`);
                const msgs = Array.isArray(msgsRes.data) ? msgsRes.data : [];
                if (msgs.length > 0) {
                  lastMsgMap[conv._id] = msgs[msgs.length - 1];
                }
              } catch (err) {}
            })
          );
          setLastMessages(lastMsgMap);
        }
      } catch (err) {
        setConversations([]);
      }
    };

    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId]);

  return (
    <div className="flex flex-col gap-2">
      {Array.isArray(conversations) && conversations.length > 0 ? (
        conversations.map((conv) => {
          const otherUserId = conv.members.find((id) => id !== currentUserId);
          const info = userInfos[otherUserId] || {};
          const lastMsg = lastMessages[conv._id];
          return (
            <button
              key={conv._id}
              onClick={() => setSelectedConversation(conv)}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white shadow-sm hover:bg-orange-50 transition cursor-pointer border border-transparent focus:outline-none focus:ring-2 focus:ring-orange-300"
              style={{ minHeight: 64 }}
            >
              <img
                src={info.profilePicture || "/default-avatar.png"}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover border-2 border-orange-100 shadow"
              />
              <div className="flex-1 flex flex-col items-start min-w-0">
                <span className="font-semibold text-base text-orange-700 truncate">
                  {info.username || "User"}
                </span>
                <span className="text-xs text-gray-500 truncate max-w-full">
                  {lastMsg ?
                    (lastMsg.isSharedPost ? "[Shared a post]" : lastMsg.text) :
                    info.biography || "No messages yet"
                  }
                </span>
              </div>
              {/* Unread badge placeholder (future) */}
              {/* <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1">2</span> */}
            </button>
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

