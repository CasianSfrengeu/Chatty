import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },
    sender: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    reactions: [
      {
        userId: String,
        emoji: String,
      }
    ],
    // For shared posts
    isSharedPost: {
      type: Boolean,
      default: false,
    },
    sharedPost: {
      postId: String,
      description: String,
      userId: String,
      username: String,
      userProfilePicture: String,
      createdAt: Date,
      likes: [String],
      comments: [String],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Message", MessageSchema);
