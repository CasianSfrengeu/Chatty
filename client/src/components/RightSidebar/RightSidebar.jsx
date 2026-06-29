import React, { useState, useEffect } from "react";
import api from "../../api";

const FEATURED_CATEGORIES = [
  { tag: "film", emoji: "🎬" },
  { tag: "music", emoji: "🎵" },
  { tag: "news", emoji: "📰" },
  { tag: "sport", emoji: "⚽" },
  { tag: "tech", emoji: "💻" },
  { tag: "gaming", emoji: "🎮" },
  { tag: "travel", emoji: "✈️" },
  { tag: "food", emoji: "🍕" },
];

const RightSidebar = ({ onHashtagClick }) => {
  const [trendingHashtags, setTrendingHashtags] = useState([]);

  useEffect(() => {
    const fetchTrendingHashtags = async () => {
      try {
        const response = await api.get("/tweets/trending-hashtags");
        setTrendingHashtags(Array.isArray(response.data) ? response.data : []);
      } catch {
        setTrendingHashtags([]);
      }
    };
    fetchTrendingHashtags();
  }, []);

  const handleHashtagClick = (hashtag) => {
    if (onHashtagClick) onHashtagClick(hashtag);
  };

  // Filter out any featured categories from the trending list to avoid duplicates
  const featuredTags = new Set(FEATURED_CATEGORIES.map((c) => c.tag));
  const extraTrending = trendingHashtags.filter((h) => !featuredTags.has(h._id));

  return (
    <div className="p-6 bg-orange-50 border border-orange-300 rounded-lg shadow-md mx-4 space-y-5">
      {/* Categories */}
      <div>
        <h2 className="text-xl font-bold text-orange-500 mb-3">Categories</h2>
        <div className="space-y-1">
          {FEATURED_CATEGORIES.map(({ tag, emoji }) => (
            <button
              key={tag}
              onClick={() => handleHashtagClick(tag)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-100 transition group text-left"
            >
              <span className="text-lg">{emoji}</span>
              <span className="font-semibold text-gray-700 group-hover:text-orange-600 transition">
                #{tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending hashtags from users (only if any beyond the fixed ones) */}
      {extraTrending.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-orange-500 mb-3">Trending</h2>
          <div className="space-y-1">
            {extraTrending.slice(0, 5).map((hashtag) => (
              <button
                key={hashtag._id}
                onClick={() => handleHashtagClick(hashtag._id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-orange-100 cursor-pointer transition group text-left"
              >
                <span className="font-semibold text-gray-700 group-hover:text-orange-600 transition">
                  #{hashtag._id}
                </span>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                  {hashtag.count} posts
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RightSidebar;
