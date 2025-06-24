import React from "react";
import { Link, useNavigate } from "react-router-dom";

import HomeIcon from "@mui/icons-material/Home";
import TagIcon from "@mui/icons-material/Tag";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/userSlice";

const LeftSidebar = () => {
  // getting the current logged-in user from the Redux store
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // handling the logout action
  const handleLogout = () => {
    dispatch(logout()); //dispatch logout action from Redux
    navigate("/signin"); //navigate to signin page
  };

  return (
    <>
      {/* Desktop/Tablet Sidebar */}
      <aside
        className="hidden md:flex fixed left-6 top-8 md:top-12 z-40 flex-col justify-between h-[90vh] w-[80px] md:w-[260px] p-4 md:p-6 rounded-3xl shadow-xl bg-white/70 backdrop-blur-lg border border-orange-100"
        style={{ boxShadow: "0 8px 32px rgba(255, 115, 0, 0.10)" }}
      >
        <nav className="flex flex-col gap-4 md:gap-6">
          <h2 className="hidden md:block text-2xl font-extrabold text-orange-500 text-center mb-2 tracking-tight select-none">
            Chatty
          </h2>
          <Link to="/">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 px-2 py-3 rounded-2xl cursor-pointer hover:bg-orange-50 transition group">
              <HomeIcon className="text-orange-500" fontSize="large" />
              <span className="hidden md:inline text-gray-700 font-semibold group-hover:text-orange-600">Home</span>
            </div>
          </Link>
          <Link to="/explore">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 px-2 py-3 rounded-2xl cursor-pointer hover:bg-orange-50 transition group">
              <TagIcon className="text-orange-500" fontSize="large" />
              <span className="hidden md:inline text-gray-700 font-semibold group-hover:text-orange-600">Explore</span>
            </div>
          </Link>
          <Link to="/chat">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 px-2 py-3 rounded-2xl cursor-pointer hover:bg-orange-50 transition group">
              <ChatBubbleOutlineIcon className="text-orange-500" fontSize="large" />
              <span className="hidden md:inline text-gray-700 font-semibold group-hover:text-orange-600">Chat</span>
            </div>
          </Link>
          <Link to={`/profile/${currentUser?._id}`}>
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 px-2 py-3 rounded-2xl cursor-pointer hover:bg-orange-50 transition group">
              <PersonIcon className="text-orange-500" fontSize="large" />
              <span className="hidden md:inline text-gray-700 font-semibold group-hover:text-orange-600">Profile</span>
            </div>
          </Link>
        </nav>
        <div className="flex flex-col items-center md:items-stretch gap-4 mt-8">
          <div className="flex flex-col items-center md:flex-row md:items-center gap-2 mb-2">
            <img
              src={currentUser?.profilePicture || "/default-avatar.png"}
              alt="avatar"
              className="w-12 h-12 rounded-full border-2 border-orange-200 shadow-md object-cover"
            />
            <span className="hidden md:inline text-gray-700 font-semibold text-base truncate max-w-[120px]">{currentUser?.username}</span>
          </div>
          <button
            className="w-12 h-12 md:w-full flex items-center justify-center md:justify-start bg-red-500 hover:bg-red-600 text-white px-0 md:px-4 py-3 rounded-full transition"
            onClick={handleLogout}
            title="Logout"
          >
            <LogoutIcon fontSize="medium" className="md:mr-2" />
            <span className="hidden md:inline font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed md:hidden bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 bg-white/80 backdrop-blur-lg border-t border-orange-100 shadow-lg">
        <Link to="/">
          <button className="flex flex-col items-center text-orange-500 hover:text-orange-600 transition">
            <HomeIcon fontSize="medium" />
            <span className="text-xs">Home</span>
          </button>
        </Link>
        <Link to="/explore">
          <button className="flex flex-col items-center text-orange-500 hover:text-orange-600 transition">
            <TagIcon fontSize="medium" />
            <span className="text-xs">Explore</span>
          </button>
        </Link>
        <Link to="/chat">
          <button className="flex flex-col items-center text-orange-500 hover:text-orange-600 transition">
            <ChatBubbleOutlineIcon fontSize="medium" />
            <span className="text-xs">Chat</span>
          </button>
        </Link>
        <Link to={`/profile/${currentUser?._id}`}>
          <button className="flex flex-col items-center text-orange-500 hover:text-orange-600 transition">
            <PersonIcon fontSize="medium" />
            <span className="text-xs">Profile</span>
          </button>
        </Link>
        <button
          className="flex flex-col items-center text-red-500 hover:text-red-600 transition"
          onClick={handleLogout}
          title="Logout"
        >
          <LogoutIcon fontSize="medium" />
          <span className="text-xs">Logout</span>
        </button>
      </nav>
    </>
  );
};

export default LeftSidebar;
