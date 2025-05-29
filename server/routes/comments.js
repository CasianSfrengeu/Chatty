// routes/comments.js
import express from "express";
import Comment from "../models/Comment.js";
import { verifyToken } from "../verifyToken.js";

const router = express.Router();

// ✅ Adaugă un comentariu nou
router.post("/", verifyToken, async (req, res) => {
  const newComment = new Comment({
    postId: req.body.postId,
    userId: req.user.id,
    text: req.body.text,
    parentId: req.body.parentId || null,
  });

  try {
    const saved = await newComment.save();
    res.status(200).json(saved);
  } catch (err) {
    res.status(500).json({ error: "Eroare la adăugarea comentariului" });
  }
});

// ✅ Obține toate comentariile pentru un post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({ createdAt: 1 });
    res.status(200).json(comments);
  } catch (err) {
    res.status(500).json({ error: "Eroare la obținerea comentariilor" });
  }
});

// ✅ Șterge un comentariu
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) return res.status(404).json("Comentariu inexistent");
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json("Poți șterge doar comentariile tale");
    }

    await comment.deleteOne();
    res.status(200).json("Comentariu șters cu succes");
  } catch (err) {
    res.status(500).json({ error: "Eroare la ștergerea comentariului" });
  }
});

// ✅ Like / Unlike pe un comentariu
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json("Comentariu inexistent");

    // Toggle like
    if (comment.likes.includes(req.user.id)) {
      comment.likes = comment.likes.filter((uid) => uid !== req.user.id);
    } else {
      comment.likes.push(req.user.id);
    }

    await comment.save();
    res.status(200).json("Like/unlike aplicat cu succes");
  } catch (err) {
    res.status(500).json({ error: "Eroare la like/unlike pe comentariu" });
  }
});


export default router;
