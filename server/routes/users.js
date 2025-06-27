// this routes component defines API endpoints for user-related operation (fetching profiles, following/unfollowing, deleting users and more)

import express from "express";
// importing multer (middleware for handling file uploads)
import multer from "multer";
import path from "path";
import { getUser, update, deleteUser, follow, unFollow, requestFollow, respondToFollowRequest } from "../controllers/user.js";
import { verifyToken } from "../verifyToken.js";
import { getUserByUsername } from "../controllers/user.js";
import User from "../models/User.js";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// configuring multer to handle file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const dest = path.join(__dirname, "../../uploads");
      cb(null, dest);
    } catch (err) {
      console.error("[MULTER] Error setting upload destination:", err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// check token, if verified the user can update their profile picture
// upload.single used to process a single file from the req body
router.put("/:id/profile", verifyToken, upload.single("image"), async (req, res) => {
  try {
    console.log("[UPLOAD] req.file:", req.file);
    console.log("[UPLOAD] req.body:", req.body);
    if (!req.file) {
      console.error("[UPLOAD] No file received");
      return res.status(400).json({ error: "No file uploaded" });
    }
    const filePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: filePath },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("[UPLOAD] Error uploading image:", err);
    res.status(500).json({ error: "Error uploading image", details: err.message });
  }
});

// Get user's followers
router.get("/followers/:userId", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get all users who are following this user
    const followers = await User.find({
      _id: { $in: user.followers }
    }).select('_id username profilePicture biography');

    res.status(200).json(followers);
  } catch (err) {
    console.error("Error fetching followers:", err);
    res.status(500).json({ error: "Error fetching followers" });
  }
});

// Specific routes first (before generic :id route)
router.get("/find/:id", getUser);
router.get("/username/:username", getUserByUsername);
router.put("/follow/:id", verifyToken, follow);
router.put("/unfollow/:id", verifyToken, unFollow);
router.put("/request-follow/:id", verifyToken, requestFollow);
router.put("/respond-follow-request/:id", verifyToken, respondToFollowRequest);

// Generic routes last
router.put("/:id", verifyToken, update);
router.delete("/:id", verifyToken, deleteUser);

export default router;
