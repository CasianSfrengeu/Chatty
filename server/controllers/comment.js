import Comment from "../models/Comment.js";
import User from "../models/User.js";
import { handleError } from "../error.js";

// 🔸 POST /api/comments
export const createComment = async (req, res, next) => {
  try {
    const newComment = new Comment(req.body);
    const saved = await newComment.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
};

// 🔸 GET /api/comments/:postId
export const getCommentsByPost = async (req, res, next) => {
  try {
    const comments = await Comment.find({ postId: req.params.postId }).sort({
      createdAt: 1,
    });

    // atașăm și username-ul fiecărui comentariu
    const commentsWithUsers = await Promise.all(
      comments.map(async (c) => {
        const user = await User.findById(c.userId);
        return {
          ...c._doc,
          username: user?.username || "Utilizator",
        };
      })
    );

    res.status(200).json(commentsWithUsers);
  } catch (err) {
    next(err);
  }
};

// 🔸 PUT /api/comments/:id/like
export const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(handleError(404, "Comentariul nu există"));

    const userId = req.body.userId;
    if (!comment.likes.includes(userId)) {
      await comment.updateOne({ $push: { likes: userId } });
      res.status(200).json("Comentariu apreciat");
    } else {
      await comment.updateOne({ $pull: { likes: userId } });
      res.status(200).json("Apreciere eliminată");
    }
  } catch (err) {
    next(err);
  }
};

// 🔸 DELETE /api/comments/:id (opțional)
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return next(handleError(404, "Comentariu inexistent"));

    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json("Comentariu șters");
  } catch (err) {
    next(err);
  }
};
 