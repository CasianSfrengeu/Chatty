// This component ensures real-time updates to the tweet interactions

import api from "../../api";
import React, { useState, useEffect } from "react";
import formatDistance from "date-fns/formatDistance";

import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";

// 🔽 Comentarii
import CommentList from "../CommentList";
import AddComment from "../AddComment";
import SharePostModal from "../SharePostModal/SharePostModal";

const Tweet = ({ tweet, setData }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [userData, setUserData] = useState();
  const [refreshComments, setRefreshComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const dateStr = formatDistance(new Date(tweet.createdAt), new Date());
  const location = useLocation().pathname;
  const { id } = useParams();

  // Fetch autor tweet
  useEffect(() => {
    const fetchData = async () => {
      try {
        const findUser = await api.get(`/users/find/${tweet.userId}`);
        setUserData(findUser.data);
      } catch (err) {
        console.log("error", err);
      }
    };

    fetchData();
  }, [tweet.userId, tweet.likes]);

  // Like/Unlike
  const handleLike = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/tweets/${tweet._id}/like`, {
        id: currentUser._id,
      });

      if (location.includes("profile")) {
        const newData = await api.get(`/tweets/user/all/${id}`);
        setData(newData.data);
      } else if (location.includes("explore")) {
        const newData = await api.get(`/tweets/explore`);
        setData(newData.data);
      } else {
        const newData = await api.get(`/tweets/timeline/${currentUser._id}`);
        setData(newData.data);
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header: Avatar, Username, Date */}
      <div className="flex items-center gap-3 mb-1">
        <img
          src={userData?.profilePicture || "/default-avatar.png"}
          alt="avatar"
          className="w-10 h-10 rounded-full border-2 border-orange-200 object-cover shadow-sm"
        />
        <div className="flex flex-col">
          <Link
            to={`/profile/${userData?._id}`}
            className="font-semibold text-orange-500 text-base leading-tight hover:underline focus:underline outline-none"
            tabIndex={0}
          >
            {userData?.username || "User"}
          </Link>
          <span className="text-xs text-gray-400 font-medium">
            {dateStr} ago
          </span>
        </div>
      </div>

      {/* Tweet Content */}
      <div className="text-lg text-gray-800 mb-2 break-words">
        {tweet.description}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 text-orange-500 mt-1 mb-2">
        <button
          className="flex items-center gap-1 hover:text-orange-600 transition"
          onClick={handleLike}
        >
          {Array.isArray(tweet.likes) && tweet.likes.includes(currentUser._id) ? (
            <FavoriteIcon fontSize="small" />
          ) : (
            <FavoriteBorderIcon fontSize="small" />
          )}
          <span className="text-sm font-semibold">
            {Array.isArray(tweet.likes) ? tweet.likes.length : 0}
          </span>
        </button>
        <span className="text-gray-400 text-sm">•</span>
        <span className="text-gray-500 text-sm">
          {tweet.comments?.length || 0} Comments
        </span>
        <span className="text-gray-400 text-sm">•</span>
        <button
          className="flex items-center gap-1 hover:text-orange-600 transition"
          onClick={() => setShowShareModal(true)}
          title="Share post"
        >
          <ShareIcon fontSize="small" />
          <span className="text-sm font-semibold">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-2 bg-orange-50 rounded-xl p-3">
        <AddComment postId={tweet._id} onCommentAdded={() => setRefreshComments(!refreshComments)} />
        <CommentList postId={tweet._id} key={refreshComments} />
      </div>

      {/* Share Post Modal */}
      <SharePostModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postId={tweet._id}
        postDescription={tweet.description}
      />
    </div>
  );
};

export default Tweet;
