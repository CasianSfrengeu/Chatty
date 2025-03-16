import React from "react";
import { Link } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import TagIcon from "@mui/icons-material/Tag";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/userSlice";

const LeftSidebar = () => {
  // getting the current logged-in user from the Redux store
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  // handling the logout action
  const handleLogout = () => {
    dispatch(logout()); //dispatch logout action from Redux
  };

  return (
    <div className="w-[250px] h-screen flex flex-col justify-between bg-white p-6 rounded-lg shadow-lg sticky top-0">
      {/* Navigation Links */}
      <div className="mt-6 flex flex-col space-y-6">
        <h2 className="text-2xl font-bold text-orange-500 text-center">
          Chatty
        </h2>

        <Link to="/">
          <div className="flex items-center space-x-4 px-4 py-3 rounded-full cursor-pointer hover:bg-orange-100 transition">
            <HomeIcon className="text-orange-500" fontSize="large" />
            <p className="text-gray-700 font-medium">Home</p>
          </div>
        </Link>

        <Link to="/explore">
          <div className="flex items-center space-x-4 px-4 py-3 rounded-full cursor-pointer hover:bg-orange-100 transition">
            <TagIcon className="text-orange-500" fontSize="large" />
            <p className="text-gray-700 font-medium">Explore</p>
          </div>
        </Link>
      </div>

      {/* User Info + Profile & Logout Buttons */}
      <div className="border-t border-gray-300 pt-4">
        <Link to={`/profile/${currentUser._id}`}>
          <div className="flex items-center space-x-4 px-4 py-3 rounded-full cursor-pointer hover:bg-orange-100 transition">
            <PersonIcon className="text-orange-500" fontSize="large" />
            <p className="text-gray-700 font-medium">Profile</p>
          </div>
        </Link>

        <button
          className="w-full flex items-center justify-center bg-red-500 text-white px-4 py-3 rounded-full hover:bg-red-600 transition mt-4"
          onClick={handleLogout}
        >
          <LogoutIcon fontSize="small" className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default LeftSidebar;
