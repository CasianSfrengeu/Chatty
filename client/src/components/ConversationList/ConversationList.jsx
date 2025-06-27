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
    <div className="flex flex-col gap-3">
      {Array.isArray(conversations) && conversations.length > 0 ? (
        conversations.map((conv) => {
          const otherUserId = conv.members.find((id) => id !== currentUserId);
          const info = userInfos[otherUserId] || {};
          const lastMsg = lastMessages[conv._id];
          return (
            <button
              key={conv._id}
              onClick={() => setSelectedConversation(conv)}
              className="group flex items-center gap-4 p-4 rounded-2xl bg-white/70 hover:bg-white/90 transition-all duration-300 cursor-pointer border border-transparent hover:border-orange-200/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300/50 transform hover:scale-[1.02]"
              style={{ minHeight: 72 }}
            >
              <div className="relative">
                <img
                  src={info.profilePicture || "/default-avatar.png"}
                  alt="avatar"
                  className="w-14 h-14 rounded-full object-cover border-3 border-orange-100 shadow-md group-hover:border-orange-200 transition-colors"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex-1 flex flex-col items-start min-w-0">
                <div className="flex items-center gap-2 w-full">
                  <span className="font-semibold text-base text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                    {info.username || "User"}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-400">now</span>
                </div>
                <span className="text-sm text-gray-600 truncate max-w-full group-hover:text-gray-700 transition-colors">
                  {lastMsg ?
                    (lastMsg.isSharedPost ? "📤 Shared a post" : lastMsg.text) :
                    info.biography || "No messages yet"
                  }
                </span>
              </div>
              {/* Unread badge placeholder (future) */}
              {/* <span className="ml-2 bg-orange-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">2</span> */}
            </button>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-4xl mb-3">💭</div>
          <p className="text-gray-500 font-medium mb-1">No conversations yet</p>
          <p className="text-gray-400 text-sm">Start a new conversation to begin chatting!</p>
        </div>
      )}
    </div>
  );
};

export default ConversationList;

