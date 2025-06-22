// src/components/Conversations/Conversations.jsx
import React, { useEffect, useState } from "react";
import api from "../../api";
import ConversationList from "../ConversationList/ConversationList";
import MessageBox from "../MessageBox/MessageBox";
import NewConversation from "../NewConversation/NewConversation";
import { useSelector } from "react-redux";

const Conversations = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await api.get(`/conversations/${currentUser._id}`);
        setConversations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log("Eroare la aducerea conversațiilor", err);
        setConversations([]);
      }
    };

    if (currentUser?._id) {
      fetchConversations();
    }
  }, [currentUser?._id]);

  const handleConversationCreated = () => {
    // Refresh conversations list
    const fetchConversations = async () => {
      try {
        const res = await api.get(`/conversations/${currentUser._id}`);
        setConversations(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log("Eroare la aducerea conversațiilor", err);
      }
    };
    fetchConversations();
  };

  return (
    <div className="flex h-screen bg-orange-50">
      {/* Left Sidebar - Conversations List */}
      <div className="w-1/3 bg-white border-r border-orange-200">
        <div className="p-4 border-b border-orange-200">
          <h2 className="text-xl font-bold text-orange-600">Conversations</h2>
        </div>
        
        <ConversationList
          currentUserId={currentUser?._id}
          setSelectedConversation={setSelectedConversation}
        />
        
        <div className="p-4 border-t border-orange-200">
          <NewConversation
            currentUserId={currentUser?._id}
            onConversationCreated={handleConversationCreated}
          />
        </div>
      </div>

      {/* Right Side - Messages */}
      <div className="flex-1">
        {selectedConversation ? (
          <MessageBox conversation={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;
