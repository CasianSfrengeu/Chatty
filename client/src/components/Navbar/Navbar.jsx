import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";

const Navbar = () => {
  return (
    <div className="w-full h-[60px] fixed top-0 left-0 bg-white shadow-md flex items-center justify-between px-6 z-50">
      {/* App Name */}
      <h1 className="text-2xl font-extrabold text-orange-500">Chatty</h1>

      {/* Search Bar */}
      <div className="relative w-[250px] md:w-[300px]">
        <SearchIcon className="absolute left-3 top-2 text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-orange-50 border border-orange-300 text-gray-800 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-orange-500 focus:outline-none"
        />
      </div>
    </div>
  );
};

export default Navbar;
