import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: [String], // array de userId-uri
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Conversation", ConversationSchema);
