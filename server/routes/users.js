// this routes component defines API endpoints for user-related operation (fetching profiles, following/unfollowing, deleting users and more)

import express from "express";
// importing multer (middleware for handling file uploads)
import multer from "multer";
import path from "path";
import { getUser, update, deleteUser, follow, unFollow } from "../controllers/user.js";
import { verifyToken } from "../verifyToken.js";
import { getUserByUsername } from "../controllers/user.js";
import User from "../models/User.js";

const router = express.Router();

// configuring multer to handle file uploads
const storage = multer.diskStorage({
  // multer will store the uploaded profile pictures in the uploads folder
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  // filename dinamically modified using Date.now() so that users can upload pictures with the same name with overwriting issues
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

// existing routes
router.put("/:id", verifyToken, update);
router.get("/find/:id", getUser);
router.delete("/:id", verifyToken, deleteUser);
router.put("/follow/:id", verifyToken, follow);
router.put("/unfollow/:id", verifyToken, unFollow);
router.get("/username/:username", getUserByUsername);

export default router;
