import React, { useState, useEffect } from "react";
import LeftSidebar from "../../components/LeftSidebar/LeftSidebar";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import EditProfile from "../../components/EditProfile/EditProfile";

import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import api from "../../api";
import Tweet from "../../components/Tweet/Tweet";

import { following } from "../../redux/userSlice";

/*

 This component displays the user's profile page (their tweets and profile information)
  -it also allows users to follow/unfollow the profile they're currently looking at
  -enables editing the profile (if viewing their own profile)

 */
const Profile = () => {
  const [open, setOpen] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [userTweets, setUserTweets] = useState([]); // storing user's tweets
  const [userProfile, setUserProfile] = useState(null); // storing user profile information

  const { id } = useParams(); // extracting the user id
  const dispatch = useDispatch();

  // fetching the user profile and tweets with GET requests
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userTweets = await api.get(`/tweets/user/all/${id}`);
        const userProfile = await api.get(`/users/find/${id}`);

        setUserTweets(Array.isArray(userTweets.data) ? userTweets.data : []);
        setUserProfile(userProfile.data);
      } catch (err) {
        console.log("error", err);
        setUserTweets([]);
      }
    };

    fetchData();
  }, [currentUser, id]);

  // follow/unfollow functionality
  const handleFollow = async () => {
    // if the current user isn't already following that user
    if (!currentUser.following.includes(id)) {
      try {
        // PUT request to send a follow request
        await api.put(`/users/follow/${id}`, { id: currentUser._id });
        // updating redux store
        dispatch(following(id));
      } catch (err) {
        console.log("error", err);
      }
    } else {
      try {
        // PUT request to send an unfollow request
        await api.put(`/users/unfollow/${id}`, { id: currentUser._id });
        // updating redux store
        dispatch(following(id));
      } catch (err) {
        console.log("error", err);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 min-h-screen mt-[60px]">
        {/* Sidebar */}
        <div className="hidden md:flex md:flex-col md:w-[250px] px-4">
          <LeftSidebar />
        </div>

        {/* Profile Section */}
        <div className="col-span-2 flex flex-col items-center p-6 bg-orange-50 border-x border-orange-300 shadow-md">
          {userProfile && (
            <>
              {/* Profile Header */}
              <div className="w-full flex flex-col items-center text-center space-y-4">
                <img
                  src={userProfile.profilePicture || "/default-avatar.png"}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-orange-300 shadow-md"
                />
                <h2 className="text-2xl font-bold text-orange-500">
                  {userProfile.username}
                </h2>
                <p className="text-gray-600">@{userProfile.username}</p>

                {/* Follow & Edit Profile Button */}
                {currentUser._id === id ? (
                  <button
                    className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
                    onClick={() => setOpen(true)}
                  >
                    Edit Profile
                  </button>
                ) : currentUser.following.includes(id) ? (
                  <button
                    className="px-4 py-2 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition"
                    onClick={handleFollow}
                  >
                    Following
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition"
                    onClick={handleFollow}
                  >
                    Follow
                  </button>
                )}
              </div>

              {/* User Tweets */}
              <div className="w-full mt-6 space-y-4">
                {userTweets &&
                  userTweets.map((tweet) => (
                    <div className="p-2" key={tweet._id}>
                      <Tweet tweet={tweet} setData={setUserTweets} />
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="hidden md:block px-4">
          <RightSidebar />
        </div>
      </div>

      {/* Edit Profile Modal */}
      {open && <EditProfile setOpen={setOpen} />}
    </>
  );
};

export default Profile;
