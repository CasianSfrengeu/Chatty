// The Explore page will display the trending posts of the app

import React from "react";
import ExploreTweets from "../../components/ExploreTweets/ExploreTweets";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import RightSidebar from "../../components/RightSidebar/RightSidebar";

// useSelector retrieves the current user's authentication status
import { useSelector } from "react-redux";
import Signin from "../Signin/Signin";


const Explore = () => {
  // using Redux to check if the user is logged in, if currentUser exists, the user is authenticated
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

          {/* Explore Tweets */}
          <div className="col-span-2 flex flex-col items-center p-6 bg-orange-50 border-x border-orange-300 shadow-md">
            <h2 className="text-2xl font-bold text-orange-500 mb-4">Explore</h2>
            <ExploreTweets />
          </div>

          {/* Right Sidebar */}
          <div className="hidden md:block px-4">
            <RightSidebar />
          </div>
        </div>
      )}
    </>
  );
};

export default Explore;
