import React, { useState } from "react";
import Conversations from "../../components/Conversations/Conversations";
import MessageBox from "../../components/MessageBox/MessageBox";
import NewConversation from "../../components/NewConversation/NewConversation";
import { useSelector } from "react-redux";

const SIDEBAR_WIDTH = "320px";

const Chat = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const handleConversationCreated = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div className="flex h-[calc(100vh-60px)] mt-[60px] bg-gradient-to-br from-orange-50 via-white to-orange-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className="flex flex-col h-full bg-white/80 backdrop-blur-sm border-r border-orange-200/50 shadow-xl"
        style={{ minWidth: SIDEBAR_WIDTH, maxWidth: SIDEBAR_WIDTH, width: SIDEBAR_WIDTH }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-6 border-b border-orange-100/50 bg-white/90 backdrop-blur-sm sticky top-0 z-10 w-full">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={currentUser?.profilePicture || "/default-avatar.png"}
                alt="avatar"
                className="w-12 h-12 rounded-full border-3 border-orange-200 object-cover shadow-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-orange-600 tracking-tight">Messages</span>
              <span className="text-xs text-gray-500">Stay connected</span>
            </div>
          </div>
        </div>
        
        {/* New Conversation Input */}
        <div className="px-4 py-4 border-b border-orange-100/50 bg-white/90 backdrop-blur-sm w-full">
          <div className="bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-2xl p-4 shadow-sm border border-orange-200/30 w-full">
            <NewConversation
              currentUserId={currentUser._id}
              onConversationCreated={handleConversationCreated}
            />
          </div>
        </div>
        
        {/* Conversation List */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-white/50 backdrop-blur-sm custom-scrollbar px-4 py-4 w-full">
          <Conversations
            currentUserId={currentUser._id}
            setSelectedConversation={setSelectedConversation}
            refresh={refresh}
          />
        </div>
      </aside>
      
      {/* Chat Window */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-gradient-to-br from-white to-orange-50/30">
        {selectedConversation ? (
          <MessageBox
            currentUser={currentUser}
            conversation={selectedConversation}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-gray-500 mb-2">No conversation selected</h3>
            <p className="text-gray-400 text-center max-w-md">
              Choose a conversation from the sidebar to start chatting with your friends
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
