import React, { useEffect, useState, useRef } from "react";
import api from "../../api";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import formatDistance from "date-fns/formatDistance";

const EMOJI_OPTIONS = ["👍", "😂", "❤️", "😮", "😢", "🔥", "👏", "🎉"];
const socket = io(window.location.origin);

const MessageBox = ({ conversation }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverUsername, setReceiverUsername] = useState("");
  const [typingStatus, setTypingStatus] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // messageId or null
  const scrollRef = useRef(null);
  const [receiverProfile, setReceiverProfile] = useState({});

  const otherUserId = conversation?.members?.find(
    (id) => id !== currentUser._id
  );

  // 🔌 Socket connection
  useEffect(() => {
    socket.emit("addUser", currentUser._id);
  }, [currentUser]);

  // 📩 Message received
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

  // 🟠 Typing indicator
  useEffect(() => {
    socket.on("typing", ({ senderName, conversationId }) => {
      if (conversationId === conversation?._id) {
        setTypingStatus(`${senderName} is typing...`);

        // Clear indicator after 2 seconds
        const timeout = setTimeout(() => setTypingStatus(null), 2000);
        return () => clearTimeout(timeout);
      }
    });

    return () => socket.off("typing");
  }, [conversation]);

  // 📥 Fetch messages
  useEffect(() => {
    if (!conversation?._id) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${conversation._id}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log("Error fetching messages:", err);
        setMessages([]);
      }
    };
    fetchMessages();
  }, [conversation]);

  // 📛 Partner username
  useEffect(() => {
    if (!otherUserId) return;
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/find/${otherUserId}`);
        setReceiverUsername(res.data?.username || "User");
        setReceiverProfile(res.data || {});
      } catch (err) {
        console.log("Error fetching user:", err);
        setReceiverUsername("User");
        setReceiverProfile({});
      }
    };
    fetchUser();
  }, [otherUserId]);

  // 🔽 Scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✉️ Send message
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
      console.log("Error sending message:", err);
    }
  };

  // 📤 Emit typing on input
  const handleTyping = () => {
    socket.emit("typing", {
      senderName: currentUser.username,
      conversationId: conversation._id,
      receiverId: otherUserId,
    });
  };

  // Add or update emoji reaction
  const handleAddReaction = async (messageId, emoji) => {
    try {
      const res = await api.patch(`/messages/${messageId}/reaction`, { emoji });
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: res.data.reactions } : msg
        )
      );
      setShowEmojiPicker(null);
    } catch (err) {
      // Optionally show error
    }
  };

  // Remove emoji reaction
  const handleRemoveReaction = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}/reaction`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: (msg.reactions || []).filter(r => r.userId !== currentUser._id) } : msg
        )
      );
    } catch (err) {}
  };

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-lg">
        Select a conversation to start chatting.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-white to-orange-50/30 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 px-6 py-5 bg-white/90 backdrop-blur-sm border-b border-orange-100/50 shadow-sm">
        <div className="relative">
          <img
            src={receiverProfile.profilePicture || "/default-avatar.png"}
            alt="avatar"
            className="w-14 h-14 rounded-full object-cover border-3 border-orange-200 shadow-md"
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-semibold text-lg text-gray-800 truncate">{receiverUsername}</span>
          <span className="text-sm text-gray-500 truncate">{receiverProfile.biography || "Active now"}</span>
        </div>
        {/* Future: Call/Video/More buttons */}
        <button className="text-gray-400 hover:text-orange-500 text-xl transition-colors p-2 rounded-full hover:bg-orange-50" title="More">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-br from-orange-50/30 to-white custom-scrollbar">
        {Array.isArray(messages) && messages.map((msg, index) => {
          const userReaction = (msg.reactions || []).find(r => r.userId === currentUser._id);
          // Group reactions by emoji
          const reactionGroups = (msg.reactions || []).reduce((acc, r) => {
            acc[r.emoji] = acc[r.emoji] ? acc[r.emoji] + 1 : 1;
            return acc;
          }, {});
          const isMine = msg.sender === currentUser._id;
          return (
            <div
              key={msg._id || index}
              ref={scrollRef}
              className={`flex flex-col items-${isMine ? "end" : "start"} w-full`}
            >
              <div
                className={`relative max-w-[75%] px-5 py-3 rounded-3xl text-base shadow-lg flex flex-col gap-2 ${
                  isMine
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white self-end rounded-br-lg"
                    : "bg-white text-gray-800 self-start border border-orange-100/50 rounded-bl-lg"
                }`}
              >
                {/* Shared Post Display */}
                {msg.isSharedPost && msg.sharedPost ? (
                  <div className={`rounded-xl p-3 mb-2 ${
                    isMine ? 'bg-orange-400/20' : 'bg-orange-50 border border-orange-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={msg.sharedPost.userProfilePicture || "/default-avatar.png"}
                        alt="avatar"
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className={`text-xs font-medium ${
                        isMine ? 'text-orange-100' : 'text-orange-600'
                      }`}>
                        {msg.sharedPost.username}
                      </span>
                    </div>
                    <p className={`text-sm mb-2 ${
                      isMine ? 'text-orange-50' : 'text-gray-800'
                    }`}>
                      {msg.sharedPost.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>❤️ {msg.sharedPost.likes?.length || 0}</span>
                      <span>💬 {msg.sharedPost.comments?.length || 0}</span>
                      <span>
                        {formatDistance(new Date(msg.sharedPost.createdAt), new Date(), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="leading-relaxed">{msg.text}</span>
                )}
                
                {/* Emoji reactions */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    className={`text-lg px-2 py-1 rounded-full focus:outline-none transition-colors ${
                      isMine 
                        ? 'hover:bg-orange-400/30' 
                        : 'hover:bg-orange-100'
                    }`}
                    onClick={() => setShowEmojiPicker(showEmojiPicker === msg._id ? null : msg._id)}
                    title={userReaction ? `Your reaction: ${userReaction.emoji}` : "Add reaction"}
                  >
                    {userReaction ? userReaction.emoji : "😊"}
                  </button>
                  
                  {/* Emoji picker popover */}
                  {showEmojiPicker === msg._id && (
                    <div className="absolute z-50 bg-white border border-orange-200 rounded-2xl shadow-xl p-3 flex gap-2 mt-8">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          className="text-xl hover:scale-125 transition-transform p-1 rounded-full hover:bg-orange-50"
                          onClick={() => handleAddReaction(msg._id, emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                      {userReaction && (
                        <button
                          className="text-xs text-red-500 ml-2 px-2 py-1 rounded-full hover:bg-red-50"
                          onClick={() => handleRemoveReaction(msg._id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  )}
                  
                  {/* Reactions display */}
                  {Object.keys(reactionGroups).length > 0 && (
                    <div className="flex gap-2 ml-2">
                      {Object.entries(reactionGroups).map(([emoji, count]) => (
                        <span key={emoji} className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${
                          isMine 
                            ? 'bg-orange-400/30 text-orange-100' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {emoji} <span className="text-xs font-bold">{count}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <span className={`text-[11px] block mt-1 text-right ${
                  isMine ? 'text-orange-100' : 'text-gray-400'
                }`}>
                  {formatDistance(new Date(msg.createdAt), new Date(), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          );
        })}
        
        {/* Typing indicator */}
        {typingStatus && (
          <div className="flex items-center gap-2 text-sm text-gray-400 italic mt-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            {typingStatus}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 z-10 flex items-center gap-3 bg-white/90 backdrop-blur-sm border-t border-orange-100/50 px-6 py-5 shadow-lg"
      >
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            handleTyping();
          }}
          className="flex-1 px-5 py-3 rounded-full border border-orange-200/50 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-base bg-white/80 backdrop-blur-sm transition-all"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full px-6 py-3 text-lg font-semibold shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageBox;
