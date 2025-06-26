import React, { useState, useEffect } from "react";
import api from "../../api";

const RightSidebar = ({ onHashtagClick }) => {
  const [trendingHashtags, setTrendingHashtags] = useState([
    { _id: "music", count: 15 },
    { _id: "movies", count: 12 },
    { _id: "politics", count: 8 },
    { _id: "romania", count: 6 }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      try {
        setIsLoading(true);
        const response = await api.get("/tweets/trending-hashtags");
        if (Array.isArray(response.data) && response.data.length > 0) {
          setTrendingHashtags(response.data);
        }
      } catch (err) {
        console.error("Error fetching trending hashtags:", err);
        // Keep default hashtags if API fails
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingHashtags();
  }, []);

  const handleHashtagClick = (hashtag) => {
    if (onHashtagClick) {
      onHashtagClick(hashtag);
    }
  };

  return (
    <div className="p-6 bg-orange-50 border border-orange-300 rounded-lg shadow-md mx-4 space-y-4">
      {/* Trending Title */}
      <h2 className="text-xl font-bold text-orange-500">Trending</h2>

      {/* Trending Topics */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 text-sm mt-2">Loading trends...</p>
          </div>
        ) : (
          trendingHashtags.map((hashtag) => (
            <div
              key={hashtag._id}
              onClick={() => handleHashtagClick(hashtag._id)}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-orange-100 cursor-pointer transition group"
            >
              <p className="font-semibold text-gray-700 group-hover:text-orange-600 transition">
                #{hashtag._id}
              </p>
              <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                {hashtag.count} posts
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RightSidebar;
