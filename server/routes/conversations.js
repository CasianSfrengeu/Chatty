import express from "express";
import Conversation from "../models/Conversation.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();

// Creează o conversație nouă între doi useri
router.post("/", verifyToken, async (req, res) => {
    const newConversation = new Conversation({
      members: [req.body.senderId, req.body.receiverId],
    });
  
    try {
      const savedConversation = await newConversation.save();
      res.status(200).json(savedConversation);
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

// Returnează toate conversațiile în care userul este membru
router.get("/:userId", verifyToken, async (req, res) => {
  console.log("📩 GET /api/conversations/:userId called");
  try {
    const conversations = await Conversation.find({
      members: { $in: [req.params.userId] },
    });
    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json(err);
  }
});

  

  export default router;
