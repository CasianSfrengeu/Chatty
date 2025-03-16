// This component ensures real-time updates to the tweet interactions

import axios from "axios";
import React, { useState, useEffect } from "react";
import formatDistance from "date-fns/formatDistance";

import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";


const Tweet = ({ tweet, setData }) => {
  // getting the current user from Redux
  const { currentUser } = useSelector((state) => state.user);
  // storing the tweet author's data
  const [userData, setUserData] = useState();

  // formatting the post's creation date
  const dateStr = formatDistance(new Date(tweet.createdAt), new Date());
  // getting the current page's location
  const location = useLocation().pathname;
  // getting the user ID from URL parameters
  const { id } = useParams();

  // fetching the tweet author's data based on the tweet's user id
  useEffect(() => {
    const fetchData = async () => {
      try {
        const findUser = await axios.get(`/users/find/${tweet.userId}`);
        setUserData(findUser.data);
      } catch (err) {
        console.log("error", err);
      }
    };

    fetchData();
  }, [tweet.userId, tweet.likes]); // runs when tweet.userId or tweet.likes changes


  //  function for liking and unliking posts
  const handleLike = async (e) => {
    e.preventDefault();

    try {
      // sending a PUT request to like/unlike the tweet
      await axios.put(`/tweets/${tweet._id}/like`, {
        id: currentUser._id,
      });
      // getting the tweets based on the page location  to update the interface
      if (location.includes("profile")) {
        const newData = await axios.get(`/tweets/user/all/${id}`);
        setData(newData.data);
      } else if (location.includes("explore")) {
        const newData = await axios.get(`/tweets/explore`);
        setData(newData.data);
      } else {
        const newData = await axios.get(`/tweets/timeline/${currentUser._id}`);
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
        </>
      )}
    </div>
  );
};

export default Tweet;
