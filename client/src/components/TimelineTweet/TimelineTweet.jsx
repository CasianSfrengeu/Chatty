// this component makes sure the user's feed is updated dynamically

import React, { useEffect, useState } from "react";
import api from "../../api";

import { useSelector } from "react-redux";
import Tweet from "../Tweet/Tweet";

const TimelineTweet = () => {
  
  // state to store the user's timeline tweets
  const [timeLine, setTimeLine] = useState(null);
  // getting the current user from the Redux store
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if no current user
      if (!currentUser?._id) {
        setTimeLine([]);
        return;
      }

      try {
        // this is the API request to get the timeline tweets
        const timelineTweets = await api.get(
          `/tweets/timeline/${currentUser._id}`
        );
        // storing the fetched posts in state
        setTimeLine(timelineTweets.data);
      } catch (err) {
        console.log("error", err);
        setTimeLine([]); // Set empty array on error
      }
    };

    fetchData();
  }, [currentUser?._id]);

  // Don't render if no current user
  if (!currentUser) {
    return (
      <div className="mt-6 text-center text-gray-500">
        Please sign in to see your timeline
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4">
      {timeLine && Array.isArray(timeLine) && timeLine.length > 0 ? (
        timeLine.map((tweet) => (
          <div
            key={tweet._id}
            className="bg-white shadow-md border border-orange-300 rounded-lg p-4"
          >
            <Tweet tweet={tweet} setData={setTimeLine} />
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">
          No tweets to show. Start posting!
        </div>
      )}
    </div>
  );
};

export default TimelineTweet;
