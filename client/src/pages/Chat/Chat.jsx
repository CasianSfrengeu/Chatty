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
    <div className="grid grid-cols-1 md:grid-cols-4 min-h-screen mt-[60px]">
      {/* Sidebar cu conversații */}
      <div className="md:col-span-1 border-r border-orange-200">
        <NewConversation
          currentUserId={currentUser._id}
          onConversationCreated={handleConversationCreated}
        />
        <Conversations
          currentUserId={currentUser._id}
          setSelectedConversation={setSelectedConversation}
          refresh={refresh}
        />
      </div>

      {/* Chat activ */}
      <div className="md:col-span-3">
        <MessageBox
          currentUser={currentUser}
          conversation={selectedConversation}
        />
      </div>
    </div>
  );
};

export default Chat;
