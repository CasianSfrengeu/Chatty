// this routes component defines API endpoints for user-related operation (fetching profiles, following/unfollowing, deleting users and more)

import express from "express";
// importing multer (middleware for handling file uploads)
import multer from "multer";
import path from "path";
import { getUser, update, deleteUser, follow, unFollow } from "../controllers/user.js";
import { verifyToken } from "../verifyToken.js";

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
    // generates a URL for the uploaded image
    const filePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    // updates the profile picture field in the database
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { profilePicture: filePath },
      { new: true }
    );
    // the updated user object is returned in JSON format
    res.status(200).json(updatedUser);
  } catch (err) {
    // we return an error if anything goes wrong
    res.status(500).json({ error: "Error uploading image" });
  }
});

// existing routes
router.put("/:id", verifyToken, update);
router.get("/find/:id", getUser);
router.delete("/:id", verifyToken, deleteUser);
router.put("/follow/:id", verifyToken, follow);
router.put("/unfollow/:id", verifyToken, unFollow);

export default router;
