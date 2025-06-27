import React, { useState } from "react";
import Conversations from "../../components/Conversations/Conversations";
import MessageBox from "../../components/MessageBox/MessageBox";
import NewConversation from "../../components/NewConversation/NewConversation";
import { useSelector } from "react-redux";

const Chat = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const handleConversationCreated = () => {
    setRefresh((prev) => !prev);
  };

  return (
    <div className="flex h-[calc(100vh-60px)] mt-[60px] bg-gradient-to-tr from-orange-50 to-white">
      {/* Sidebar */}
      <aside className="w-[350px] min-w-[280px] max-w-[400px] h-full bg-white border-r border-orange-200 flex flex-col shadow-lg">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <img
              src={currentUser?.profilePicture || "/default-avatar.png"}
              alt="avatar"
              className="w-10 h-10 rounded-full border-2 border-orange-200 object-cover shadow-sm"
            />
            <span className="font-bold text-xl text-orange-500 tracking-tight">Chats</span>
          </div>
          <button className="text-orange-400 hover:text-orange-600 text-2xl transition" title="Settings">
            <i className="fas fa-cog"></i>
          </button>
        </div>
        {/* New Conversation (FAB style on desktop) */}
        <div className="px-6 py-3 border-b border-orange-100">
          <NewConversation
            currentUserId={currentUser._id}
            onConversationCreated={handleConversationCreated}
          />
        </div>
        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 py-2">
          <Conversations
            currentUserId={currentUser._id}
            setSelectedConversation={setSelectedConversation}
            refresh={refresh}
          />
        </div>
      </aside>
      {/* Chat Window */}
      <main className="flex-1 flex flex-col h-full">
        <MessageBox
          currentUser={currentUser}
          conversation={selectedConversation}
        />
      </main>
    </div>
  );
};

export default Chat;
