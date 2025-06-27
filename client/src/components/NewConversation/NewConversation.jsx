import React, { useState } from "react";
import api from "../../api";

const NewConversation = ({ currentUserId, onConversationCreated }) => {
  const [usernameInput, setUsernameInput] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateConversation = async (e) => {
    e.preventDefault();

    if (!usernameInput.trim()) {
      setFeedback("Please enter a username.");
      return;
    }

    setIsLoading(true);
    setFeedback("");

    try {
      // Step 1: Find user by username
      const resUser = await api.get(`/users/username/${usernameInput}`);
      const receiver = resUser.data;

      if (receiver._id === currentUserId) {
        setFeedback("You cannot start a conversation with yourself.");
        return;
      }

      // Step 2: Check if conversation already exists
      const resConv = await api.get(`/conversations/${currentUserId}`);
      const conversations = Array.isArray(resConv.data) ? resConv.data : [];
      const alreadyExists = conversations.some((conv) =>
        conv.members.includes(receiver._id)
      );

      if (alreadyExists) {
        setFeedback("Conversation already exists.");
        return;
      }

      // Step 3: Create conversation
      await api.post("/conversations", {
        senderId: currentUserId,
        receiverId: receiver._id,
      });

      // Trigger refresh
      if (onConversationCreated) onConversationCreated();

      setFeedback("Conversation created successfully!");
      setUsernameInput("");

    } catch (err) {
      console.log("Error:", err);
      setFeedback("User not found or an error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mb-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
          <span className="text-orange-600 text-sm font-bold">+</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-800">
          New Conversation
        </h3>
      </div>
      
      <form onSubmit={handleCreateConversation} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Enter username..."
            value={usernameInput}
            onChange={(e) => setUsernameInput(e.target.value)}
            className="w-full px-4 py-3 border border-orange-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white/80 backdrop-blur-sm transition-all"
            disabled={isLoading}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !usernameInput.trim()}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Creating...
            </div>
          ) : (
            "Start Conversation"
          )}
        </button>
      </form>
      
      {feedback && (
        <div className={`p-3 rounded-xl text-sm font-medium ${
          feedback.includes('Error') || feedback.includes('not found') || feedback.includes('already exists') || feedback.includes('cannot start')
            ? 'bg-red-100 text-red-700 border border-red-200'
            : 'bg-green-100 text-green-700 border border-green-200'
        }`}>
          {feedback}
        </div>
      )}
    </div>
  );
};

export default NewConversation;
