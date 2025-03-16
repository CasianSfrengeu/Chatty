import React from "react";

const RightSidebar = () => {
  return (
    <div className="p-6 bg-orange-50 border border-orange-300 rounded-lg shadow-md mx-4 space-y-4">
      {/* Trending Title */}
      <h2 className="text-xl font-bold text-orange-500">Trending</h2>

      {/* Trending Topics */}
      <div className="space-y-3">
        <p className="font-semibold text-gray-700 hover:text-orange-600 cursor-pointer transition">
          #music
        </p>
        <p className="font-semibold text-gray-700 hover:text-orange-600 cursor-pointer transition">
          #movies
        </p>
        <p className="font-semibold text-gray-700 hover:text-orange-600 cursor-pointer transition">
          #politics
        </p>
        <p className="font-semibold text-gray-700 hover:text-orange-600 cursor-pointer transition">
          #romania
        </p>
      </div>
    </div>
  );
};

export default RightSidebar;
