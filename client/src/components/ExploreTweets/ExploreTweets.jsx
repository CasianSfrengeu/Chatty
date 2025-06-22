import React, { useEffect, useState } from "react";
import api from "../../api";
import { useSelector } from "react-redux";
import Tweet from "../Tweet/Tweet";

const ExploreTweets = () => {

  // state to store tweets from the backend
  const [explore, setExplore] = useState([]);

  // fetching current user info from the Redux state
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // fetching explore tweets
        const exploreTweets = await api.get("/tweets/explore");
        // storing the retrieved tweets in state
        setExplore(Array.isArray(exploreTweets.data) ? exploreTweets.data : []);
      } catch (err) {
        console.error("Error fetching explore tweets:", err);
        setExplore([]);
      }
    };
    fetchData();
  }, [currentUser?._id]);

  return (
    <div className="p-6 bg-orange-50 min-h-screen flex flex-col items-center">
      {/* Header */}
      <h2 className="text-3xl font-extrabold text-orange-500 mb-6 text-center">
        Explore Tweets
      </h2>

      {/* Tweet Cards: Fixed Width & Proper Wrapping */}
      <div className="flex flex-wrap justify-center gap-6 w-full max-w-5xl">
        {Array.isArray(explore) && explore.length > 0 ? (
          explore.map((tweet) => (
            <div
              key={tweet._id}
              className="p-5 bg-white rounded-lg shadow-lg w-[300px] text-center"
            >
              <Tweet tweet={tweet} setData={setExplore} />
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center mt-10">
            No tweets to explore. Be the first to post something!
          </p>
        )}
      </div>
    </div>
  );
};

export default ExploreTweets;
