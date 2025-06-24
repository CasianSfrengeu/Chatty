import React, { useState } from "react";
import TimelineTweet from "../TimelineTweet/TimelineTweet";

import { useSelector } from "react-redux";
import api from "../../api";

const MainTweet = () => {
  const [tweetText, setTweetText] = useState("");
  const { currentUser } = useSelector((state) => state.user);

  // handling the tweets submission process
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/tweets", {
        userId: currentUser._id,
        description: tweetText,
      });
      setTweetText("");
      window.location.reload(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Post Input Card */}
      <div className="card mb-8 relative">
        <div className="flex items-start gap-4">
          <img
            src={currentUser?.profilePicture || "/default-avatar.png"}
            alt="avatar"
            className="w-12 h-12 rounded-full border-2 border-orange-200 object-cover shadow"
          />
          <form className="flex-1" onSubmit={handleSubmit}>
            <textarea
              value={tweetText}
              onChange={(e) => setTweetText(e.target.value)}
              placeholder="What's on your mind?"
              maxLength={280}
              className="w-full p-4 bg-orange-50 border border-orange-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none text-lg min-h-[64px] mb-2 shadow-sm"
              style={{ fontFamily: 'inherit' }}
            ></textarea>
            <div className="flex justify-end">
              <button
                type="submit"
                className="orange-gradient px-6 py-2 rounded-full font-semibold shadow-md hover:scale-105 transition"
                disabled={!tweetText.trim()}
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Timeline Feed */}
      <TimelineTweet />

      {/* Floating Action Button for Posting (mobile only) */}
      <button
        className="fab md:hidden"
        title="New Post"
        onClick={() => {
          document.querySelector('textarea')?.focus();
        }}
      >
        +
      </button>
    </div>
  );
};

export default MainTweet;
