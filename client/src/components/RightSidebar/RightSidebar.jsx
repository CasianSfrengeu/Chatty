import React from "react";

const CATEGORIES = [
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
  const handleClick = (tag) => {
    if (onHashtagClick) onHashtagClick(tag);
  };

  return (
    <div className="p-6 bg-orange-50 border border-orange-300 rounded-lg shadow-md mx-4 space-y-3">
      <h2 className="text-xl font-bold text-orange-500">Trending</h2>
      {CATEGORIES.map(function(item) {
        return (
          <div
            key={item.tag}
            onClick={() => handleClick(item.tag)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-orange-100 cursor-pointer transition group"
          >
            <span className="text-lg">{item.emoji}</span>
            <span className="font-semibold text-gray-700 group-hover:text-orange-600 transition">
              #{item.tag}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default RightSidebar;
