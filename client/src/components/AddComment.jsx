// src/components/Comments/AddComment.jsx
import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const AddComment = ({ postId, onCommentAdded }) => {
  const [text, setText] = useState("");
  const { currentUser } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await axios.post(
        "/comments",
        { postId, text },
        { withCredentials: true }
      );
      setText("");
      if (onCommentAdded) onCommentAdded(); // Trigger re-fetch în CommentList
    } catch (err) {
      console.error("Eroare la adăugare comentariu:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2 mt-2">
      <input
        type="text"
        placeholder="Adaugă un comentariu..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded"
      />
      <button className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600">
        Postează
      </button>
    </form>
  );
};

export default AddComment;
