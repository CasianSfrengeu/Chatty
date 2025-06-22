// This component ensures real-time updates to the tweet interactions

import api from "../../api";
import React, { useState, useEffect } from "react";
import formatDistance from "date-fns/formatDistance";

import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";

// 🔽 Comentarii
import CommentList from "../CommentList";
import AddComment from "../AddComment";

const Tweet = ({ tweet, setData }) => {
  const { currentUser } = useSelector((state) => state.user);
  const [userData, setUserData] = useState();
  const [refreshComments, setRefreshComments] = useState(false);

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
    <div className="bg-white shadow-md border border-orange-300 rounded-lg p-4 space-y-2">
      {userData && (
        <>
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Link to={`/profile/${userData._id}`} className="font-bold text-orange-500 hover:underline">
              {userData.username}
            </Link>
            <span className="text-gray-600">@{userData.username}</span>
            <p className="text-gray-500"> - {dateStr}</p>
          </div>

          {/* Tweet Content */}
          <p className="text-gray-800">{tweet.description}</p>

          {/* Like Button */}
          <button onClick={handleLike} className="flex items-center space-x-1 text-gray-700 hover:text-orange-500 transition">
            {tweet.likes.includes(currentUser._id) ? (
              <FavoriteIcon className="text-orange-500" />
            ) : (
              <FavoriteBorderIcon />
            )}
            <span>{tweet.likes.length}</span>
          </button>

          {/* 🔽 Comentarii */}
          <div className="mt-4 border-t border-orange-200 pt-4 space-y-3">
            <h4 className="text-orange-500 font-semibold text-sm">Comentarii</h4>
            <AddComment
              postId={tweet._id}
              onCommentAdded={() => setRefreshComments((prev) => !prev)}
            />
            <CommentList postId={tweet._id} key={refreshComments} />
          </div>
        </>
      )}
    </div>
  );
};

export default Tweet;
