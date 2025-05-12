import React, { useState } from "react";
import ConversationList from "../../components/Chat/ConversationList";
import MessageBox from "../../components/Chat/MessageBox";
import { useSelector } from "react-redux";

const ChatPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [selectedConversation, setSelectedConversation] = useState(null);

  return (
    <div className="flex h-[calc(100vh-60px)] mt-[60px]">
      {/* Sidebar cu conversații */}
      <div className="w-1/3 border-r border-orange-300">
        <ConversationList
          currentUserId={currentUser._id}
          setSelectedConversation={setSelectedConversation}
        />
      </div>

      {/* Fereastra de chat */}
      <div className="w-2/3 p-4">
        {selectedConversation ? (
          <MessageBox
            conversation={selectedConversation}
            currentUser={currentUser}
          />
        ) : (
          <p className="text-gray-500 text-center mt-20">
            Selectează o conversație pentru a începe să comunici.
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
