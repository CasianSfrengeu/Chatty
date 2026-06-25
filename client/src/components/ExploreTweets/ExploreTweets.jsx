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
    <div className="mt-6 space-y-6">
      {Array.isArray(explore) && explore.length > 0 ? (
        explore.map((tweet) => (
          <div key={tweet._id} className="card hover:shadow-xl transition duration-200">
            <Tweet tweet={tweet} setData={setExplore} />
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">
          No tweets to explore. Be the first to post something!
        </div>
      )}
    </div>
  );
};

export default ExploreTweets;
