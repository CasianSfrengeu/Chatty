import express from "express";
import Message from "../models/Message.js";
import Tweet from "../models/Tweet.js";
import User from "../models/User.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();

// Trimite un mesaj într-o conversație
router.post("/", verifyToken, async (req, res) => {
    const newMessage = new Message({
      conversationId: req.body.conversationId,
      sender: req.body.sender,
      text: req.body.text,
    });
  
    try {
      const savedMessage = await newMessage.save();
      res.status(200).json(savedMessage);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  
  // Obține toate mesajele unei conversații
router.get("/:conversationId", verifyToken, async (req, res) => {
    try {
      const messages = await Message.find({
        conversationId: req.params.conversationId,
      });
      res.status(200).json(messages);
    } catch (err) {
      res.status(500).json(err);
    }
  });

// Add or update a reaction to a message
router.patch("/:messageId/reaction", verifyToken, async (req, res) => {
  const { emoji } = req.body;
  const userId = req.user.id;
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });
    // Remove previous reaction by this user
    message.reactions = message.reactions.filter(r => r.userId !== userId);
    // Add new reaction
    message.reactions.push({ userId, emoji });
    await message.save();
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove a reaction from a message
router.delete("/:messageId/reaction", verifyToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });
    message.reactions = message.reactions.filter(r => r.userId !== userId);
    await message.save();
    res.status(200).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Share a post in a conversation
router.post("/share-post", verifyToken, async (req, res) => {
  const { conversationId, postId, receiverId } = req.body;
  const senderId = req.user.id;

  try {
    // Get the post details
    const post = await Tweet.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Get the post author details
    const postAuthor = await User.findById(post.userId);
    if (!postAuthor) {
      return res.status(404).json({ error: "Post author not found" });
    }

    // Create shared post message
    const sharedMessage = new Message({
      conversationId,
      sender: senderId,
      text: "shared a post",
      isSharedPost: true,
      sharedPost: {
        postId: post._id,
        description: post.description,
        userId: post.userId,
        username: postAuthor.username,
        userProfilePicture: postAuthor.profilePicture,
        createdAt: post.createdAt,
        likes: post.likes || [],
        comments: post.comments || [],
      },
    });

    const savedMessage = await sharedMessage.save();
    res.status(200).json(savedMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
