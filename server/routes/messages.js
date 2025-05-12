import express from "express";
import Message from "../models/Message.js";
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
  
  export default router;
