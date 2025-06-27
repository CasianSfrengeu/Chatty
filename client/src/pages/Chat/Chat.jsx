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
      <aside className="flex flex-col w-[340px] min-w-[260px] max-w-[400px] h-full bg-white border-r border-orange-200 shadow-lg">
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
        </div>
        {/* New Conversation Input+Button as a single card */}
        <div className="px-4 py-4 border-b border-orange-100 bg-white">
          <div className="bg-orange-50 rounded-xl p-3 flex flex-col gap-2 shadow-sm">
            <NewConversation
              currentUserId={currentUser._id}
              onConversationCreated={handleConversationCreated}
            />
          </div>
        </div>
        {/* Conversation List - scrollable, fills rest of sidebar */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-white custom-scrollbar px-0 py-2">
          <Conversations
            currentUserId={currentUser._id}
            setSelectedConversation={setSelectedConversation}
            refresh={refresh}
          />
        </div>
      </aside>
      {/* Chat Window */}
      <main className="flex-1 flex flex-col h-full min-w-0">
        {selectedConversation ? (
          <MessageBox
            currentUser={currentUser}
            conversation={selectedConversation}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-xl">
            Select a conversation to start chatting.
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;
