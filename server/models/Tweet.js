import mongoose from "mongoose";

// defining the Tweet model
const TweetSchema = new mongoose.Schema(
  {
    // userId defined as a string
    userId: {
      type: String,
      required: true,
    },
    // description - string, and a character limit
    description: {
      type: String,
      required: true,
      max: 280,
    },
    // likes array, starting as null
    likes: {
      type: Array,
      defaultValue: [],
    },
    // hashtags array to store extracted hashtags
    hashtags: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tweet", TweetSchema);
