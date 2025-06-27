// src/components/Conversations/Conversations.jsx
import React from "react";
import ConversationList from "../ConversationList/ConversationList";
import NewConversation from "../NewConversation/NewConversation";

const Conversations = ({ currentUserId, setSelectedConversation, refresh }) => {
  return (
    <>
      <ConversationList
        currentUserId={currentUserId}
        setSelectedConversation={setSelectedConversation}
        refresh={refresh}
      />
    </>
  );
};

export default Conversations;
