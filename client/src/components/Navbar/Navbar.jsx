import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
      // Navigate to home page to show search results
      navigate("/");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <div className="w-full h-[60px] fixed top-0 left-0 bg-white shadow-md flex items-center justify-between px-6 z-50">
      {/* App Name */}
      <h1 className="text-2xl font-extrabold text-orange-500">Chatty</h1>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative w-[250px] md:w-[300px]">
        <SearchIcon className="absolute left-3 top-2 text-gray-500" />
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full bg-orange-50 border border-orange-300 text-gray-800 rounded-full py-2 pl-10 pr-12 focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!searchQuery.trim()}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-500 text-white rounded-full p-1 hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SearchIcon fontSize="small" />
        </button>
      </form>
    </div>
  );
};

export default Navbar;
