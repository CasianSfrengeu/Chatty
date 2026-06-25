import React, { useEffect, useState, useRef } from "react";
import api from "../../api";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import formatDistance from "date-fns/formatDistance";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

const EMOJI_OPTIONS = ["👍", "😂", "❤️", "😮", "😢", "🔥", "👏", "🎉"];
const socket = io(window.location.origin);

const MessageBox = ({ conversation }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverUsername, setReceiverUsername] = useState("");
  const [typingStatus, setTypingStatus] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [hoveredMsg, setHoveredMsg] = useState(null);
  const [receiverProfile, setReceiverProfile] = useState({});
  const scrollRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const otherUserId = conversation?.members?.find((id) => id !== currentUser._id);

  // Socket connection
  useEffect(() => {
    socket.emit("addUser", currentUser._id);
  }, [currentUser]);

  // Receive message
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

  // Typing indicator
  useEffect(() => {
    const handleTypingEvent = ({ senderName, conversationId }) => {
      if (conversationId === conversation?._id) {
        setTypingStatus(`${senderName} is typing...`);
        const timeout = setTimeout(() => setTypingStatus(null), 2000);
        return () => clearTimeout(timeout);
      }
    };
    socket.on("typing", handleTypingEvent);
    return () => socket.off("typing", handleTypingEvent);
  }, [conversation]);

  // Fetch messages
  useEffect(() => {
    if (!conversation?._id) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${conversation._id}`);
        setMessages(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setMessages([]);
      }
    };
    fetchMessages();
  }, [conversation]);

  // Fetch partner info
  useEffect(() => {
    if (!otherUserId) return;
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/find/${otherUserId}`);
        setReceiverUsername(res.data?.username || "User");
        setReceiverProfile(res.data || {});
      } catch {
        setReceiverUsername("User");
        setReceiverProfile({});
      }
    };
    fetchUser();
  }, [otherUserId]);

  // Scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Send text message
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
      socket.emit("sendMessage", { ...message, receiverId: otherUserId });
    } catch (err) {
      console.log("Error sending message:", err);
    }
  };

  const handleTyping = () => {
    socket.emit("typing", {
      senderName: currentUser.username,
      conversationId: conversation._id,
      receiverId: otherUserId,
    });
  };

  // Add/update emoji reaction
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
      console.log("Error adding reaction:", err);
    }
  };

  // Remove emoji reaction
  const handleRemoveReaction = async (messageId) => {
    try {
      await api.delete(`/messages/${messageId}/reaction`);
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                reactions: (msg.reactions || []).filter(
                  (r) => r.userId !== currentUser._id
                ),
              }
            : msg
        )
      );
    } catch (err) {
      console.log("Error removing reaction:", err);
    }
  };

  // Like/unlike a shared post from chat
  const handleLikeSharedPost = async (msg) => {
    if (!msg.sharedPost?.postId) return;
    try {
      await api.put(`/tweets/${msg.sharedPost.postId}/like`, {
        id: currentUser._id,
      });
      setMessages((prev) =>
        prev.map((m) => {
          if (m._id !== msg._id) return m;
          const likes = m.sharedPost.likes || [];
          const alreadyLiked = likes.includes(currentUser._id);
          return {
            ...m,
            sharedPost: {
              ...m.sharedPost,
              likes: alreadyLiked
                ? likes.filter((id) => id !== currentUser._id)
                : [...likes, currentUser._id],
            },
          };
        })
      );
    } catch (err) {
      console.log("Error liking shared post:", err);
    }
  };

  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-gray-400 p-8 select-none">
        <div className="text-[90px] mb-6 opacity-70">💬</div>
        <h3 className="text-2xl font-bold text-gray-500 mb-2">
          No conversation selected
        </h3>
        <p className="text-gray-400 text-center max-w-md text-lg">
          Choose a conversation from the sidebar to start chatting with your
          friends
        </p>
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
          <span className="font-semibold text-lg text-gray-800 truncate">
            {receiverUsername}
          </span>
          <span className="text-sm text-gray-500 truncate">
            {receiverProfile.biography || "Active now"}
          </span>
        </div>
        <button
          className="text-gray-400 hover:text-orange-500 text-xl transition-colors p-2 rounded-full hover:bg-orange-50"
          title="More"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-gradient-to-br from-orange-50/30 to-white custom-scrollbar">
        {Array.isArray(messages) &&
          messages.map((msg, index) => {
            const isMine = msg.sender === currentUser._id;
            const msgKey = msg._id || index;
            const myReaction = (msg.reactions || []).find(
              (r) => r.userId === currentUser._id
            );
            const reactionGroups = (msg.reactions || []).reduce((acc, r) => {
              if (!acc[r.emoji]) acc[r.emoji] = [];
              acc[r.emoji].push(r.userId);
              return acc;
            }, {});

            return (
              <div
                key={msgKey}
                className={`flex flex-col items-${isMine ? "end" : "start"} w-full`}
                onMouseEnter={() => setHoveredMsg(msgKey)}
                onMouseLeave={() => setHoveredMsg(null)}
              >
                {/* Bubble row */}
                <div className="relative flex items-end gap-2">
                  {/* Emoji button — left side for received messages */}
                  {!isMine && (
                    <div
                      className={`self-center transition-opacity duration-150 ${
                        hoveredMsg === msgKey ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <button
                        onClick={() =>
                          setShowEmojiPicker(
                            showEmojiPicker === msgKey ? null : msgKey
                          )
                        }
                        className="text-lg p-1 rounded-full hover:bg-orange-100 hover:scale-110 transition"
                        title="React"
                      >
                        😊
                      </button>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`relative max-w-[75%] px-5 py-3 rounded-3xl text-base shadow-lg flex flex-col gap-2 ${
                      isMine
                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white self-end rounded-br-lg"
                        : "bg-white text-gray-800 self-start border border-orange-100/50 rounded-bl-lg"
                    }`}
                  >
                    {/* Shared post card */}
                    {msg.isSharedPost && msg.sharedPost ? (
                      <div
                        className={`rounded-xl p-3 mb-1 ${
                          isMine
                            ? "bg-orange-400/20"
                            : "bg-orange-50 border border-orange-200"
                        }`}
                      >
                        {/* Author row */}
                        <Link
                          to={`/profile/${msg.sharedPost.userId}`}
                          className="flex items-center gap-2 mb-2 hover:opacity-80 transition"
                        >
                          <img
                            src={
                              msg.sharedPost.userProfilePicture ||
                              "/default-avatar.png"
                            }
                            alt="avatar"
                            className="w-7 h-7 rounded-full object-cover border border-orange-200"
                          />
                          <span
                            className={`text-xs font-semibold ${
                              isMine ? "text-orange-100" : "text-orange-600"
                            }`}
                          >
                            {msg.sharedPost.username}
                          </span>
                          <span
                            className={`text-xs ${
                              isMine ? "text-orange-200" : "text-gray-400"
                            }`}
                          >
                            {formatDistance(
                              new Date(msg.sharedPost.createdAt),
                              new Date(),
                              { addSuffix: true }
                            )}
                          </span>
                        </Link>

                        {/* Post content */}
                        <p
                          className={`text-sm mb-3 leading-relaxed ${
                            isMine ? "text-orange-50" : "text-gray-800"
                          }`}
                        >
                          {msg.sharedPost.description}
                        </p>

                        {/* Post actions */}
                        <div
                          className={`flex items-center gap-4 pt-2 border-t ${
                            isMine
                              ? "border-orange-400/30"
                              : "border-orange-100"
                          }`}
                        >
                          <button
                            onClick={() => handleLikeSharedPost(msg)}
                            className={`flex items-center gap-1 transition hover:scale-110 ${
                              isMine
                                ? "text-orange-100 hover:text-white"
                                : "text-orange-500 hover:text-orange-600"
                            }`}
                            title="Like post"
                          >
                            {(msg.sharedPost.likes || []).includes(
                              currentUser._id
                            ) ? (
                              <FavoriteIcon style={{ fontSize: 16 }} />
                            ) : (
                              <FavoriteBorderIcon style={{ fontSize: 16 }} />
                            )}
                            <span className="text-xs font-semibold">
                              {(msg.sharedPost.likes || []).length}
                            </span>
                          </button>
                          <span
                            className={`text-xs ${
                              isMine ? "text-orange-200" : "text-gray-400"
                            }`}
                          >
                            💬 {(msg.sharedPost.comments || []).length}
                          </span>
                          <Link
                            to={`/profile/${msg.sharedPost.userId}`}
                            className={`text-xs font-medium ml-auto hover:underline underline-offset-2 transition ${
                              isMine
                                ? "text-orange-100 hover:text-white"
                                : "text-orange-500 hover:text-orange-600"
                            }`}
                          >
                            View post →
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <span className="leading-relaxed">{msg.text}</span>
                    )}

                    {/* Timestamp */}
                    <span
                      className={`text-[11px] block mt-1 text-right ${
                        isMine ? "text-orange-100" : "text-gray-400"
                      }`}
                    >
                      {msg.createdAt
                        ? formatDistance(new Date(msg.createdAt), new Date(), {
                            addSuffix: true,
                          })
                        : "just now"}
                    </span>
                  </div>

                  {/* Emoji button — right side for sent messages */}
                  {isMine && (
                    <div
                      className={`self-center transition-opacity duration-150 ${
                        hoveredMsg === msgKey ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <button
                        onClick={() =>
                          setShowEmojiPicker(
                            showEmojiPicker === msgKey ? null : msgKey
                          )
                        }
                        className="text-lg p-1 rounded-full hover:bg-orange-100 hover:scale-110 transition"
                        title="React"
                      >
                        😊
                      </button>
                    </div>
                  )}
                </div>

                {/* Reactions display */}
                {Object.keys(reactionGroups).length > 0 && (
                  <div
                    className={`flex flex-wrap gap-1 mt-1 ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    {Object.entries(reactionGroups).map(([emoji, users]) => (
                      <button
                        key={emoji}
                        onClick={() =>
                          users.includes(currentUser._id)
                            ? handleRemoveReaction(msg._id)
                            : handleAddReaction(msg._id, emoji)
                        }
                        className={`text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 transition ${
                          users.includes(currentUser._id)
                            ? "bg-orange-100 border-orange-300 text-orange-700"
                            : "bg-gray-100 border-gray-200 text-gray-600 hover:bg-orange-50"
                        }`}
                      >
                        {emoji}{" "}
                        <span className="font-semibold">{users.length}</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Emoji picker */}
                {showEmojiPicker === msgKey && msg._id && (
                  <div
                    ref={emojiPickerRef}
                    className={`flex gap-1 flex-wrap bg-white rounded-2xl shadow-xl border border-orange-100 p-2 mt-1 max-w-[230px] z-50 ${
                      isMine ? "self-end" : "self-start"
                    }`}
                  >
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() =>
                          myReaction?.emoji === emoji
                            ? handleRemoveReaction(msg._id)
                            : handleAddReaction(msg._id, emoji)
                        }
                        className={`text-xl hover:scale-125 transition p-1 rounded-lg ${
                          myReaction?.emoji === emoji
                            ? "bg-orange-100"
                            : "hover:bg-gray-100"
                        }`}
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}

                {/* Invisible scroll anchor for last message */}
                {index === messages.length - 1 && (
                  <div ref={scrollRef} />
                )}
              </div>
            );
          })}

        {/* Typing indicator */}
        {typingStatus && (
          <div className="flex items-center gap-2 text-sm text-gray-400 italic mt-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              ></div>
              <div
                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
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
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default MessageBox;
