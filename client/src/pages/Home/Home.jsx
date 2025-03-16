import React from "react";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import MainTweet from "../../components/MainTweet/MainTweet";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import Signin from "../Signin/Signin";

// useSelector retrieves the current user's authentication status
import { useSelector } from "react-redux";

const Home = () => {
  // currentUser retrieves the user's current authentication state
  const { currentUser } = useSelector((state) => state.user);

  return (
    <>
      {/* If currentUser is null, the Signin page will be shown instead */}
      {!currentUser ? (
        <Signin />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 min-h-screen mt-[60px]">
          {/* Sidebar */}
          <div className="hidden md:flex md:flex-col md:w-[250px] px-4">
            <LeftSidebar />
          </div>

          {/* Main Content */}
          <div className="col-span-2 flex flex-col items-center p-6">
            <MainTweet />
          </div>

          {/* Right Sidebar (Trending Section) */}
          <div className="hidden md:block px-4">
            <RightSidebar />
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
