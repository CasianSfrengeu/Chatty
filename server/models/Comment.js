// models/Comment.js
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    likes: {
      type: [String], // user IDs
      default: [],
    },
    parentId: {
      type: String, // pentru reply-uri
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", CommentSchema);
