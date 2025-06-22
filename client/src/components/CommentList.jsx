import React, { useEffect, useState } from "react";
import api from "../api";
import formatDistance from "date-fns/formatDistance";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSelector } from "react-redux";

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const { currentUser } = useSelector((state) => state.user);
  const [replyText, setReplyText] = useState({});
  const [showReply, setShowReply] = useState({});
  const [userMap, setUserMap] = useState({});

  // Fetch comments & user data
  const fetchComments = async () => {
    try {
      const res = await api.get(`/comments/${postId}`);
      
      // Ensure res.data is an array
      const commentsData = Array.isArray(res.data) ? res.data : [];
      setComments(commentsData);

      if (commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map((c) => c.userId))];
        const userRes = await Promise.all(
          userIds.map((id) => api.get(`/users/find/${id}`))
        );

        const userMapObj = {};
        userRes.forEach((res) => {
          if (res.data && res.data._id) {
            userMapObj[res.data._id] = res.data.username;
          }
        });
        setUserMap(userMapObj);
      }
    } catch (err) {
      console.error("Eroare la fetch comments", err);
      setComments([]); // Set empty array on error
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleLike = async (commentId) => {
    try {
      await api.put(`/comments/${commentId}/like`, {
        userId: currentUser._id,
      });
      setComments((prev) =>
        prev.map((c) =>
          c._id === commentId
            ? {
                ...c,
                likes: Array.isArray(c.likes) && c.likes.includes(currentUser._id)
                  ? c.likes.filter((id) => id !== currentUser._id)
                  : [...(Array.isArray(c.likes) ? c.likes : []), currentUser._id],
              }
            : c
        )
      );
    } catch (err) {
      console.error("Eroare la like comment", err);
    }
  };

  const handleReply = async (parentId) => {
    if (!replyText[parentId]) return;
    try {
      await api.post(
        "/comments",
        {
          postId,
          text: replyText[parentId],
          parentId,
        }
      );

      setReplyText((prev) => ({ ...prev, [parentId]: "" }));
      setShowReply((prev) => ({ ...prev, [parentId]: false }));
      fetchComments();
    } catch (err) {
      console.error("Eroare la reply", err);
    }
  };

  const handleDelete = async (commentId) => {
    const confirm = window.confirm("Ștergi comentariul?");
    if (!confirm) return;

    try {
      await api.delete(`/comments/${commentId}`);
      fetchComments();
    } catch (err) {
      console.error("Eroare la ștergere", err);
    }
  };

  const nestedReplies = (parentId) =>
    comments
      .filter((c) => c.parentId === parentId)
      .map((reply) => (
        <div
          key={reply._id}
          className="ml-6 mt-2 border-l border-orange-200 pl-4"
        >
          <p className="text-sm text-orange-600 font-semibold">
            {userMap[reply.userId] || "Anonim"}
          </p>
          <p>{reply.text}</p>
          <div className="text-xs text-gray-500 flex gap-4 mt-1 items-center">
            <span>{formatDistance(new Date(reply.createdAt), new Date())} ago</span>
            <span
              onClick={() => handleLike(reply._id)}
              className="cursor-pointer flex items-center"
            >
              {Array.isArray(reply.likes) && reply.likes.includes(currentUser._id) ? (
                <FavoriteIcon fontSize="small" className="text-orange-500" />
              ) : (
                <FavoriteBorderIcon fontSize="small" />
              )}
              <span className="ml-1">{Array.isArray(reply.likes) ? reply.likes.length : 0}</span>
            </span>
            {reply.userId === currentUser._id && (
              <DeleteIcon
                fontSize="small"
                onClick={() => handleDelete(reply._id)}
                className="cursor-pointer text-red-400 hover:text-red-600"
              />
            )}
          </div>
        </div>
      ));

  return (
    <div className="space-y-4">
      {Array.isArray(comments) && comments
        .filter((c) => !c.parentId)
        .map((comment) => (
          <div key={comment._id} className="border-b pb-2">
            <p className="text-sm text-orange-600 font-semibold">
              {userMap[comment.userId] || "Anonim"}
            </p>
            <p>{comment.text}</p>

            <div className="text-xs text-gray-500 flex gap-4 mt-1 items-center">
              <span>
                {formatDistance(new Date(comment.createdAt), new Date())} ago
              </span>
              <span
                onClick={() => handleLike(comment._id)}
                className="cursor-pointer flex items-center"
              >
                {Array.isArray(comment.likes) && comment.likes.includes(currentUser._id) ? (
                  <FavoriteIcon fontSize="small" className="text-orange-500" />
                ) : (
                  <FavoriteBorderIcon fontSize="small" />
                )}
                <span className="ml-1">{Array.isArray(comment.likes) ? comment.likes.length : 0}</span>
              </span>
              <span
                onClick={() =>
                  setShowReply((prev) => ({
                    ...prev,
                    [comment._id]: !prev[comment._id],
                  }))
                }
                className="cursor-pointer"
              >
                Reply
              </span>
              {comment.userId === currentUser._id && (
                <DeleteIcon
                  fontSize="small"
                  onClick={() => handleDelete(comment._id)}
                  className="cursor-pointer text-red-400 hover:text-red-600"
                />
              )}
            </div>

            {showReply[comment._id] && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  className="flex-1 border border-orange-300 rounded px-2 py-1 text-sm"
                  placeholder="Răspunde..."
                  value={replyText[comment._id] || ""}
                  onChange={(e) =>
                    setReplyText((prev) => ({
                      ...prev,
                      [comment._id]: e.target.value,
                    }))
                  }
                />
                <button
                  onClick={() => handleReply(comment._id)}
                  className="bg-orange-500 text-white px-3 rounded"
                >
                  Trimite
                </button>
              </div>
            )}

            {nestedReplies(comment._id)}
          </div>
        ))}
    </div>
  );
};

export default CommentList;
