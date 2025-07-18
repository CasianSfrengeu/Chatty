import mongoose from "mongoose";

// defining the User model
const UserSchema = new mongoose.Schema(
  {
    // username field defined as string (must be unique)
    username: {
      type: String,
      required: true,
      unique: true,
    },
    // email - string, also unique
    email: { type: String, required: true, unique: true },
    // password - string
    password: { type: String, required: true },
    // porfile - string
    profileProfile: { type: String },
    // the followers and following array starting empty
    followers: { type: Array, defaultValue: [] },
    following: { type: Array, defaultValue: [] },
    // profile description as a string
    description: { type: String },
    // profile picture as a string
    profilePicture: { type: String },
    // new fields for profile customization
    biography: { type: String, maxlength: 500 },
    backgroundColor: { type: String, default: "#FF6B35" }, // default orange
    isPrivate: { type: Boolean, default: false }, // false = public, true = private
    pendingFollowers: { type: Array, defaultValue: [] }, // for private accounts
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);
