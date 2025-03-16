// this component makes sure the user's feed is updated dynamically

import React, { useEffect, useState } from "react";
import axios from "axios";

import { useSelector } from "react-redux";
import Tweet from "../Tweet/Tweet";

const TimelineTweet = () => {
  
  // state to store the user's timeline tweets
  const [timeLine, setTimeLine] = useState(null);
  // getting the current user from the Redux store
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // this is the API request to get the timeline tweets
        const timelineTweets = await axios.get(
          `/tweets/timeline/${currentUser._id}`
        );
        // storing the fetched posts in state
        setTimeLine(timelineTweets.data);
      } catch (err) {
        console.log("error", err);
      }
    };

    fetchData();
  }, [currentUser._id]);

  return (
    <div className="mt-6 space-y-4">
      {timeLine &&
        timeLine.map((tweet) => (
          <div
            key={tweet._id}
            className="bg-white shadow-md border border-orange-300 rounded-lg p-4"
          >
            <Tweet tweet={tweet} setData={setTimeLine} />
          </div>
        ))}
    </div>
  );
};

export default TimelineTweet;
