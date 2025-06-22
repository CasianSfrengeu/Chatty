import React, { useState } from "react";
import TimelineTweet from "../TimelineTweet/TimelineTweet";

import { useSelector } from "react-redux";
import api from "../../api";

const MainTweet = () => {

  // state that manages the tweet input
  const [tweetText, setTweetText] = useState("");

  const { currentUser } = useSelector((state) => state.user);

  // handling the tweets submission process
  const handleSubmit = async (e) => {
    // preventing default form submission
    e.preventDefault();
    try {
      // sending a request to the server and reloading the page to show the new tweet
      const submitTweet = await api.post("/tweets", {
        userId: currentUser._id,
        description: tweetText,
      });
      window.location.reload(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      {/* User Info */}
      {currentUser && (
        <p className="font-semibold text-orange-500 text-lg mb-4">
          {currentUser.username}
        </p>
      )}

      {/* Tweet Input */}
      <form className="border-b-2 pb-6">
        <textarea
          onChange={(e) => setTweetText(e.target.value)}
          type="text"
          placeholder="What's on your mind?"
          maxLength={280}
          className="w-full p-3 bg-orange-50 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
        ></textarea>

        {/* Tweet Button */}
        <button
          onClick={handleSubmit}
          className="bg-orange-500 text-white font-semibold py-2 px-6 rounded-full mt-4 hover:bg-orange-600 transition duration-300 float-right"
        >
          Post
        </button>
      </form>

      {/* Timeline */}
      <TimelineTweet />
    </div>
  );
};

export default MainTweet;
