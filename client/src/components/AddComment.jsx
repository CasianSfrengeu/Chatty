// src/components/Comments/AddComment.jsx
import React, { useState } from "react";
import api from "../api";
import { useSelector } from "react-redux";

const AddComment = ({ postId, onCommentAdded }) => {
  const [text, setText] = useState("");
  const { currentUser } = useSelector((state) => state.user);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await api.post(
        "/comments",
        { postId, text }
      );
      setText("");
      if (onCommentAdded) onCommentAdded(); // Trigger re-fetch în CommentList
    } catch (err) {
      console.error("Eroare la adăugare comentariu:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-2">
      <input
        type="text"
        placeholder="Add a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 px-3 py-2 border border-orange-200 rounded-xl bg-orange-50 focus:ring-2 focus:ring-orange-400 focus:outline-none text-sm"
      />
      <button className="orange-gradient px-4 py-2 rounded-xl font-semibold text-sm shadow-md hover:scale-105 transition">
        Post
      </button>
    </form>
  );
};

export default AddComment;
